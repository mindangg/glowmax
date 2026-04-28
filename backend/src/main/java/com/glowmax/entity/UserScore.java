package com.glowmax.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * UserScore — 1 row / user.
 *
 * Lean v2: bỏ @Version (race condition không quan trọng giai đoạn đầu).
 *
 * Score logic (giữ Supabase compat):
 *  - combined_score = overall_score × 7 + tier_idx × 5 (max 100)
 *  - Khi user submit lại: GREATEST(new, old) cho overall + combined
 *  - Category scores: COALESCE (preserve existing nếu null)
 */
@Entity
@Table(name = "user_scores")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserScore {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true, columnDefinition = "uuid")
    private UUID userId;

    @Column(nullable = false)
    private String username;

    @Column(name = "overall_score", nullable = false, precision = 4, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    @Column(name = "psl_tier")
    private String pslTier;

    @Column(name = "potential_tier")
    private String potentialTier;

    @Column(name = "appeal_score", precision = 4, scale = 2)
    private BigDecimal appealScore;

    @Column(name = "jaw_score", precision = 4, scale = 2)
    private BigDecimal jawScore;

    @Column(name = "eyes_score", precision = 4, scale = 2)
    private BigDecimal eyesScore;

    @Column(name = "nose_score", precision = 4, scale = 2)
    private BigDecimal noseScore;

    @Column(name = "hair_score", precision = 4, scale = 2)
    private BigDecimal hairScore;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "combined_score", precision = 6, scale = 2)
    private BigDecimal combinedScore;

    @Column(name = "style_type")
    private String styleType;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false)
    private OffsetDateTime updatedAt;
}
