package com.glowmax.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public final class AnalyzeDtos {

    private AnalyzeDtos() {}

    public record AnalyzeRequest(
            @NotBlank String photo,                  // base64 JPEG (no data URL prefix)
            @NotBlank @Pattern(regexp = "^(male|female|other)$") String gender,
            @Min(13) @Max(100) int age
    ) {}

    public record TrialScanRequest(@NotBlank String photo) {}

    /** Đồng bộ với types/index.ts FullAnalysisResult của frontend */
    public record FullAnalysisResponse(
            String pslTier,
            String potentialTier,
            BigDecimal overallScore,
            String styleType,
            Map<String, ResultCategory> categories
    ) {}

    public record ResultCategory(
            BigDecimal score,
            String tier,                              // 'Bad' | 'OK' | 'Good' | 'Great'
            List<MetricResult> metrics,
            List<String> tips
    ) {}

    public record MetricResult(
            String name,
            BigDecimal value,
            BigDecimal idealMin,
            BigDecimal idealMax,
            String status                             // 'below' | 'ideal' | 'above'
    ) {}

    public record TrialScanResponse(
            BigDecimal overallScore,
            String pslTier,
            String teaser
    ) {}
}
