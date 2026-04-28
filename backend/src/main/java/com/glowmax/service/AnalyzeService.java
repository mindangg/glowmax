package com.glowmax.service;

import com.glowmax.dto.AnalyzeDtos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Face analysis service — replace 2 Supabase Edge Functions (analyze-face + trial-scan).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyzeService {

    private final OpenAiService openAiService;

    public FullAnalysisResponse analyze(UUID userId, AnalyzeRequest req) {
        // TODO:
        //  1. validatePhoto(req.photo()) — base64 valid, decoded size <5MB, magic bytes JPEG/PNG
        //  2. String json = openAiService.analyzeFace(req.photo(), req.gender(), req.age())
        //  3. Parse JSON với Jackson ObjectMapper → FullAnalysisResponse
        //  4. Validate: tier valid, scores in range, all 9 categories present
        //  5. KHÔNG store ảnh raw (privacy)
        //  6. Log usage (userId, model, timestamp) cho cost tracking
        throw new UnsupportedOperationException("TODO");
    }

    public TrialScanResponse trialScan(UUID userId, TrialScanRequest req) {
        // TODO: simpler — chỉ trả overallScore + pslTier
        //  Có thể dùng GPT-4o-mini cho rẻ 10x
        throw new UnsupportedOperationException("TODO");
    }
}
