package com.glowmax.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public final class AnalyzeDtos {

    private AnalyzeDtos() {}

    public record AnalyzeRequest(
            @NotBlank String photo,
            @NotBlank @Pattern(regexp = "^(male|female|other)$") String gender,
            @Min(13) @Max(100) int age
    ) {}

    public record TrialScanRequest(@NotBlank String photo) {}

    // Frontend FullAnalysisResult shape — categories is array, fields camelCase
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public record FullAnalysisResponse(
            PslResult pslResult,
            List<ResultCategoryData> categories
    ) {}

    // psl_tier / potential_tier / style_type / date — explicit snake_case (global naming strategy doesn't apply reliably to nested records in Spring Boot 4.0)
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public record PslResult(
            String pslTier,
            String potentialTier,
            @JsonInclude(JsonInclude.Include.NON_NULL) String styleType,
            String date
    ) {}

    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public record ResultCategoryData(
            String category,
            String title,
            BigDecimal overallScore,
            List<MetricScore> metrics
    ) {}

    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MetricScore(
            String name,
            String subtitle,
            BigDecimal score,
            String label,
            String description,
            List<String> tips,
            BigDecimal measurement,
            String unit,
            String idealRange,
            String displayLabel
    ) {}

    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public record TrialScanResponse(
            BigDecimal overallScore,
            String pslTier,
            String teaser
    ) {}
}
