package com.glowmax.repository;

import com.glowmax.entity.UserScore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/**
 * UserScore repo — bao gồm cả query leaderboard (rank computed via window function).
 *
 * Lean v2: KHÔNG dùng view + LeaderboardEntry entity riêng nữa. Dùng native query trả Object[]
 * hoặc projection interface — service layer tự build LeaderboardEntryDto.
 */
public interface UserScoreRepository extends JpaRepository<UserScore, UUID> {

    Optional<UserScore> findByUserId(UUID userId);

    /**
     * Leaderboard top N — rank computed via PostgreSQL window function.
     * Trả: [user_id, username, overall_score, combined_score, rank, total_users, ...all PSL fields...]
     *
     * TODO sau: dùng interface projection (LeaderboardProjection) cho type-safe hơn.
     */
    @Query(value = """
            SELECT
                user_id, username, overall_score,
                COALESCE(combined_score, overall_score * 7) AS combined_score,
                psl_tier, potential_tier,
                appeal_score, jaw_score, eyes_score, nose_score, hair_score,
                photo_url, style_type,
                rank()   OVER (ORDER BY COALESCE(combined_score, overall_score * 7) DESC)::int AS rank,
                count(*) OVER ()::int                                                            AS total_users
            FROM user_scores
            WHERE is_public = TRUE
            ORDER BY rank ASC
            """, nativeQuery = true)
    Page<Object[]> findLeaderboard(Pageable pageable);

    /**
     * Search by username partial match — case-insensitive.
     */
    @Query(value = """
            SELECT
                user_id, username, overall_score,
                COALESCE(combined_score, overall_score * 7) AS combined_score,
                psl_tier, potential_tier,
                appeal_score, jaw_score, eyes_score, nose_score, hair_score,
                photo_url, style_type,
                rank()   OVER (ORDER BY COALESCE(combined_score, overall_score * 7) DESC)::int AS rank,
                count(*) OVER ()::int                                                            AS total_users
            FROM user_scores
            WHERE is_public = TRUE
              AND LOWER(username) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY rank ASC
            """, nativeQuery = true)
    Page<Object[]> searchByUsername(@Param("q") String q, Pageable pageable);

    /**
     * Lấy rank của 1 user cụ thể (dùng sau submit score để return về client).
     */
    @Query(value = """
            SELECT rank, total_users FROM (
                SELECT user_id,
                       rank()   OVER (ORDER BY COALESCE(combined_score, overall_score * 7) DESC)::int AS rank,
                       count(*) OVER ()::int                                                            AS total_users
                FROM user_scores
                WHERE is_public = TRUE
            ) sub
            WHERE user_id = :userId
            """, nativeQuery = true)
    Object[] findRankByUserId(@Param("userId") UUID userId);
}
