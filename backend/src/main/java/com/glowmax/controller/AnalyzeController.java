package com.glowmax.controller;

import com.glowmax.dto.AnalyzeDtos.*;
import com.glowmax.service.AnalyzeService;
import com.glowmax.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analyze")
@RequiredArgsConstructor
public class AnalyzeController {

    private final AnalyzeService analyzeService;
    private final RateLimitService rateLimit;

    /**
     * POST /api/v1/analyze/full
     * Rate limit: 10/giờ/user (OpenAI tốn $$).
     */
    @PostMapping("/full")
    public ResponseEntity<FullAnalysisResponse> analyzeFull(
            @AuthenticationPrincipal String userIdStr,
            @Valid @RequestBody AnalyzeRequest body) {
        // TODO:
        //  rateLimit.checkOrThrow("analyze:" + userIdStr, 10, Duration.ofHours(1));
        //  return ok(analyzeService.analyze(UUID.fromString(userIdStr), body));
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * POST /api/v1/analyze/trial
     * Public-ish — anonymous user gọi được. Rate limit: 3/ngày/IP.
     */
    @PostMapping("/trial")
    public ResponseEntity<TrialScanResponse> trialScan(
            HttpServletRequest request,
            @AuthenticationPrincipal String userIdStr,
            @Valid @RequestBody TrialScanRequest body) {
        // TODO:
        //  String ip = extractClientIp(request);
        //  rateLimit.checkOrThrow("trial:" + ip, 3, Duration.of(1, ChronoUnit.DAYS));
        //  UUID userId = userIdStr != null ? UUID.fromString(userIdStr) : null;
        //  return ok(analyzeService.trialScan(userId, body));
        throw new UnsupportedOperationException("TODO");
    }
}
