package com.glowmax.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowmax.dto.AnalyzeDtos.*;
import com.glowmax.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * Face analysis service — replace 2 Supabase Edge Functions (analyze-face + trial-scan).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyzeService {

    private final OpenAiService openAiService;
    private final ObjectMapper objectMapper;

    @Value("${glowmax.openai.model}")
    private String model;

    private static final Set<String> VALID_TIERS = Set.of(
            "Sub 3", "Sub 5", "LTN", "MTN", "HTN", "Chang", "True Chang"
    );

    public FullAnalysisResponse analyze(UUID userId, AnalyzeRequest req) {
        validatePhoto(req.photo());
        String json = openAiService.analyzeFace(req.photo(), req.gender(), req.age());
        checkRefusal(json, userId);
        try {
            FullAnalysisResponse response = parseFullAnalysis(json);
            validateFullAnalysis(response);
            int totalMetrics = response.categories().stream().mapToInt(c -> c.metrics().size()).sum();
            log.info("analyze completed userId={} tier={} totalMetrics={} model={}",
                    userId, response.pslResult().pslTier(), totalMetrics, model);
            return response;
        } catch (JsonProcessingException e) {
            log.error("Failed to parse OpenAI response userId={}", userId, e);
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "OPENAI_FAILED", "Analysis response parse error");
        }
    }

    public TrialScanResponse trialScan(UUID userId, TrialScanRequest req) {
        validatePhoto(req.photo());
        String json = openAiService.analyzeFace(req.photo(), "unknown", 25);
        checkRefusal(json, userId);
        try {
            JsonNode root = objectMapper.readTree(json);
            BigDecimal overallScore = firstDecimal(root, "overall_score", "overallScore");
            String pslTier = firstString(root, "psl_tier", "pslTier");
            if (pslTier == null) pslTier = "LTN";
            log.info("trialScan completed userId={} tier={}", userId, pslTier);
            return new TrialScanResponse(overallScore, pslTier, buildTeaser(pslTier, overallScore));
        } catch (JsonProcessingException e) {
            log.error("Failed to parse trial scan response userId={}", userId, e);
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "OPENAI_FAILED", "Trial scan response parse error");
        }
    }

    private void checkRefusal(String json, UUID userId) {
        if (json == null) return;
        String trimmed = json.trim();
        // OpenAI refusal pattern: returns near-empty JSON (e.g. "{}") or {"refused":...} when content policy blocks the image
        if (trimmed.length() < 50 || trimmed.equalsIgnoreCase("{}")) {
            log.warn("OpenAI returned near-empty response (likely content policy refusal) userId={} content={}", userId, trimmed);
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "PHOTO_REJECTED",
                    "Ảnh không phù hợp để phân tích. Vui lòng dùng ảnh chụp khuôn mặt rõ ràng, mặc trang phục lịch sự, đủ sáng và không bị che.");
        }
    }

    private void validatePhoto(String photo) {
        if (photo.length() > 7 * 1024 * 1024) {
            throw BusinessException.badRequest("PHOTO_TOO_LARGE", "Photo must be less than 5MB");
        }
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(photo);
        } catch (IllegalArgumentException e) {
            throw BusinessException.badRequest("INVALID_PHOTO", "Photo must be valid base64");
        }
        if (bytes.length > 5 * 1024 * 1024) {
            throw BusinessException.badRequest("PHOTO_TOO_LARGE", "Photo must be less than 5MB");
        }
        if (bytes.length < 4 || (!isJpeg(bytes) && !isPng(bytes))) {
            throw BusinessException.badRequest("INVALID_PHOTO_FORMAT", "Photo must be JPEG or PNG");
        }
    }

    private static boolean isJpeg(byte[] b) { return b[0] == (byte) 0xFF && b[1] == (byte) 0xD8; }
    private static boolean isPng(byte[] b)  { return b[0] == (byte) 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'; }

    private FullAnalysisResponse parseFullAnalysis(String json) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(json);

        PslResult psl = new PslResult(
                firstString(root, "psl_tier", "pslTier"),
                firstString(root, "potential_tier", "potentialTier"),
                firstString(root, "style_type", "styleType"),
                LocalDate.now().toString()
        );

        List<ResultCategoryData> categories = new ArrayList<>();
        JsonNode catsNode = root.path("categories");
        if (catsNode.isArray()) {
            for (JsonNode cat : catsNode) {
                String key = cat.path("category").asText(null);
                if (key == null) continue;
                categories.add(new ResultCategoryData(
                        key,
                        cat.path("title").asText(""),
                        firstDecimal(cat, "overallScore", "overall_score", "score"),
                        parseMetrics(cat.path("metrics"))
                ));
            }
        }

        return new FullAnalysisResponse(psl, categories);
    }

    private List<MetricScore> parseMetrics(JsonNode metricsNode) {
        if (!metricsNode.isArray()) return List.of();
        List<MetricScore> results = new ArrayList<>();
        for (JsonNode m : metricsNode) {
            results.add(new MetricScore(
                    m.path("name").asText(null),
                    m.path("subtitle").asText(""),
                    firstDecimal(m, "score"),
                    m.hasNonNull("label") ? m.path("label").asText() : null,
                    m.path("description").asText(""),
                    parseStringList(m.path("tips")),
                    firstDecimal(m, "measurement"),
                    firstString(m, "unit"),
                    firstString(m, "idealRange", "ideal_range"),
                    firstString(m, "displayLabel", "display_label")
            ));
        }
        return results;
    }

    private static List<String> parseStringList(JsonNode node) {
        if (!node.isArray()) return List.of();
        List<String> out = new ArrayList<>();
        for (JsonNode n : node) out.add(n.asText());
        return out;
    }

    private static BigDecimal toDecimal(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) return null;
        if (node.isNumber()) return node.decimalValue();
        if (node.isTextual()) {
            try { return new BigDecimal(node.asText().trim()); }
            catch (NumberFormatException e) { return null; }
        }
        return null;
    }

    private static BigDecimal firstDecimal(JsonNode parent, String... keys) {
        for (String k : keys) {
            JsonNode n = parent.path(k);
            if (!n.isMissingNode() && !n.isNull()) {
                BigDecimal d = toDecimal(n);
                if (d != null) return d;
            }
        }
        return null;
    }

    private static String firstString(JsonNode parent, String... keys) {
        for (String k : keys) {
            JsonNode n = parent.path(k);
            if (!n.isMissingNode() && !n.isNull()) {
                return n.asText();
            }
        }
        return null;
    }

    private void validateFullAnalysis(FullAnalysisResponse r) {
        String tier = r.pslResult() != null ? r.pslResult().pslTier() : null;
        if (tier == null || !VALID_TIERS.contains(tier)) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "OPENAI_INVALID_RESPONSE",
                    "Invalid PSL tier: " + tier);
        }
        if (r.categories() == null || r.categories().size() < 7) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "OPENAI_INVALID_RESPONSE",
                    "Missing required categories");
        }
    }

    private static String buildTeaser(String pslTier, BigDecimal overallScore) {
        String score = overallScore != null ? overallScore.toPlainString() : "N/A";
        return String.format(
                "Bạn đạt tier %s với điểm tổng %s. Mở khóa phân tích đầy đủ để khám phá hơn 20 chỉ số chi tiết về xương hàm, mắt, mũi và da.",
                pslTier, score);
    }
}
