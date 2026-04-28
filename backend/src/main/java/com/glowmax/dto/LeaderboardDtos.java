package com.glowmax.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public final class LeaderboardDtos {

    private LeaderboardDtos() {}

    public record SubmitScoreRequest(
            @DecimalMin("0") @DecimalMax("10") BigDecimal overallScore,
            boolean isPublic,
            @NotBlank String pslTier,
            String potentialTier,
            @DecimalMin("0") @DecimalMax("10") BigDecimal appealScore,
            @DecimalMin("0") @DecimalMax("10") BigDecimal jawScore,
            @DecimalMin("0") @DecimalMax("10") BigDecimal eyesScore,
            @DecimalMin("0") @DecimalMax("10") BigDecimal noseScore,
            @DecimalMin("0") @DecimalMax("10") BigDecimal hairScore,
            String photoUrl,
            String styleType
    ) {}

    public record SubmitScoreResponse(
            int rank,
            int totalUsers,
            BigDecimal combinedScore
    ) {}

    public record LeaderboardEntryDto(
            String username,
            BigDecimal overallScore,
            BigDecimal combinedScore,
            int rank,
            String pslTier,
            String potentialTier,
            BigDecimal appealScore,
            BigDecimal jawScore,
            BigDecimal eyesScore,
            BigDecimal noseScore,
            BigDecimal hairScore,
            String photoUrl,
            String styleType
    ) {}

    public record LeaderboardPageResponse(
            List<LeaderboardEntryDto> entries,
            int page,
            int size,
            int totalUsers
    ) {}
}
