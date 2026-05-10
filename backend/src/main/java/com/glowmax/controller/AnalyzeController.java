package com.glowmax.controller;

import com.glowmax.annotation.RateLimit;
import com.glowmax.dto.AnalyzeDtos.AnalyzeRequest;
import com.glowmax.dto.AnalyzeDtos.FullAnalysisResponse;
import com.glowmax.dto.AnalyzeDtos.TrialScanRequest;
import com.glowmax.dto.AnalyzeDtos.TrialScanResponse;
import com.glowmax.service.AnalyzeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.temporal.ChronoUnit;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analyze")
@RequiredArgsConstructor
public class AnalyzeController {

    private final AnalyzeService analyzeService;

    /**
     * POST /api/v1/analyze/full
     * Rate limit: 10/giờ/user
     */
    @RateLimit(capacity = 10, window = 1, unit = ChronoUnit.HOURS, keyType = RateLimit.KeyType.USER, keyPrefix = "analyze")
    @PostMapping("/full")
    public ResponseEntity<FullAnalysisResponse> analyzeFull(
            @AuthenticationPrincipal String userIdStr,
            @Valid @RequestBody AnalyzeRequest body) {
        return ResponseEntity.ok(analyzeService.analyze(UUID.fromString(userIdStr), body));
    }

    /**
     * POST /api/v1/analyze/trial
     * Public-ish — anonymous user gọi được. Rate limit: 3/ngày/IP.
     */
    @RateLimit(capacity = 3, window = 1, unit = ChronoUnit.DAYS, keyType = RateLimit.KeyType.IP, keyPrefix = "trial")
    @PostMapping("/trial")
    public ResponseEntity<TrialScanResponse> trialScan(
            @AuthenticationPrincipal String userIdStr,
            @Valid @RequestBody TrialScanRequest body) {
        UUID userId = userIdStr != null ? UUID.fromString(userIdStr) : null;
        return ResponseEntity.ok(analyzeService.trialScan(userId, body));
    }
}
