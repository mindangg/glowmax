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
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
    private static final Pattern RANGE_PATTERN = Pattern.compile("([\\d.]+)\\s*[-–]\\s*([\\d.]+)");

    public FullAnalysisResponse analyze(UUID userId, AnalyzeRequest req) {
        validatePhoto(req.photo());
        String json = openAiService.analyzeFace(req.photo(), req.gender(), req.age());
        try {
            FullAnalysisResponse response = parseFullAnalysis(json);
            validateFullAnalysis(response);
            log.info("analyze completed userId={} tier={} model={}", userId, response.pslTier(), model);
            return response;
        } catch (JsonProcessingException e) {
            log.error("Failed to parse OpenAI response userId={}", userId, e);
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "OPENAI_FAILED", "Analysis response parse error");
        }
    }

    public TrialScanResponse trialScan(UUID userId, TrialScanRequest req) {
        validatePhoto(req.photo());
        String json = openAiService.analyzeFace(req.photo(), "unknown", 25);
        try {
            JsonNode root = objectMapper.readTree(json);
            BigDecimal overallScore = toDecimal(root.path("overall_score"));
            String pslTier = root.path("psl_tier").asText("LTN");
            log.info("trialScan completed userId={} tier={}", userId, pslTier);
            return new TrialScanResponse(overallScore, pslTier, buildTeaser(pslTier, overallScore));
        } catch (JsonProcessingException e) {
            log.error("Failed to parse trial scan response userId={}", userId, e);
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "OPENAI_FAILED", "Trial scan response parse error");
        }
    }

    private void validatePhoto(String photo) {
        // Check encoded length first to avoid decoding huge payloads into heap
        // 5MB decoded ≈ 6.8MB base64 — use 7MB as ceiling
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

        String pslTier       = root.path("psl_tier").asText(null);
        String potentialTier = root.path("potential_tier").asText(null);
        BigDecimal overallScore = toDecimal(root.path("overall_score"));
        String styleType     = root.path("style_type").asText(null);

        Map<String, ResultCategory> categories = new LinkedHashMap<>();
        JsonNode catsNode = root.path("categories");
        if (catsNode.isArray()) {
            for (JsonNode cat : catsNode) {
                String key = cat.path("category").asText(null);
                if (key == null) continue;
                BigDecimal catScore = toDecimal(cat.path("overallScore"));
                List<MetricResult> metrics = parseMetrics(cat.path("metrics"));
                categories.put(key, new ResultCategory(catScore, scoreTier(catScore), metrics, List.of()));
            }
        }

        return new FullAnalysisResponse(pslTier, potentialTier, overallScore, styleType, categories);
    }

    private List<MetricResult> parseMetrics(JsonNode metricsNode) {
        if (!metricsNode.isArray()) return List.of();
        List<MetricResult> results = new ArrayList<>();
        for (JsonNode m : metricsNode) {
            String name = m.path("name").asText(null);
            BigDecimal value = m.has("measurement") ? toDecimal(m.path("measurement")) : null;
            BigDecimal[] range = parseRange(m.path("idealRange").asText(null));
            results.add(new MetricResult(name, value,
                    range != null ? range[0] : null,
                    range != null ? range[1] : null,
                    deriveStatus(value, range)));
        }
        return results;
    }

    private BigDecimal[] parseRange(String idealRange) {
        if (idealRange == null || idealRange.isBlank()) return null;
        Matcher m = RANGE_PATTERN.matcher(idealRange);
        if (m.find()) {
            try {
                return new BigDecimal[]{new BigDecimal(m.group(1)), new BigDecimal(m.group(2))};
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private String deriveStatus(BigDecimal value, BigDecimal[] range) {
        if (value == null || range == null) return null;
        if (value.compareTo(range[0]) < 0) return "below";
        if (value.compareTo(range[1]) > 0) return "above";
        return "ideal";
    }

    private static BigDecimal toDecimal(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) return null;
        return node.isNumber() ? node.decimalValue() : null;
    }

    private static String scoreTier(BigDecimal score) {
        if (score == null) return "OK";
        double s = score.doubleValue();
        if (s >= 8.0) return "Great";
        if (s >= 6.0) return "Good";
        if (s >= 4.0) return "OK";
        return "Bad";
    }

    private void validateFullAnalysis(FullAnalysisResponse r) {
        if (r.pslTier() == null || !VALID_TIERS.contains(r.pslTier())) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "OPENAI_INVALID_RESPONSE",
                    "Invalid PSL tier: " + r.pslTier());
        }
        if (r.overallScore() == null
                || r.overallScore().compareTo(BigDecimal.ZERO) < 0
                || r.overallScore().compareTo(BigDecimal.TEN) > 0) {
            throw new BusinessException(HttpStatus.BAD_GATEWAY, "OPENAI_INVALID_RESPONSE",
                    "Overall score out of range");
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
