package com.glowmax.service;

import com.glowmax.dto.LeaderboardDtos.*;
import com.glowmax.entity.Profile;
import com.glowmax.entity.UserScore;
import com.glowmax.exception.BusinessException;
import com.glowmax.repository.ProfileRepository;
import com.glowmax.repository.UserRepository;
import com.glowmax.repository.UserScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LeaderboardService {

    private final UserScoreRepository userScoreRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    /** PSL tier order (đồng bộ frontend lib/constants.ts) — index dùng cho combined_score. */
    private static final List<String> PSL_TIER_ORDER = List.of(
            "Sub 3", "Sub 5", "LTN", "MTN", "HTN", "Chang", "True Chang"
    );

    @Transactional
    public SubmitScoreResponse submitScore(UUID userId, SubmitScoreRequest req) {
        // 1. Reject anonymous users
        userRepository.findById(userId)
                .filter(u -> !u.isAnonymous())
                .orElseThrow(() -> BusinessException.forbidden("ANONYMOUS_NOT_ALLOWED",
                        "Anonymous users cannot submit scores"));

        // 2. Compute combined score: overall × 7 + tierIdx × 5
        int tierIdx = tierIndex(req.pslTier());
        BigDecimal combined = req.overallScore()
                .multiply(BigDecimal.valueOf(7))
                .add(BigDecimal.valueOf((long) tierIdx * 5));

        // 3. Username from profile
        String username = profileRepository.findById(userId)
                .map(Profile::getUsername)
                .orElseThrow(() -> BusinessException.notFound("PROFILE_NOT_FOUND", "Profile not found"));

        // 4. Upsert: GREATEST for overall+combined, COALESCE for category scores
        Optional<UserScore> existing = userScoreRepository.findByUserId(userId);
        UserScore score;
        if (existing.isPresent()) {
            score = existing.get();
            score.setUsername(username);
            score.setPublic(req.isPublic());

            if (req.overallScore().compareTo(score.getOverallScore()) > 0) {
                score.setOverallScore(req.overallScore());
            }
            BigDecimal currentCombined = score.getCombinedScore() != null
                    ? score.getCombinedScore() : BigDecimal.ZERO;
            if (combined.compareTo(currentCombined) > 0) {
                score.setCombinedScore(combined);
                score.setPslTier(req.pslTier());
                score.setPotentialTier(req.potentialTier());
                score.setStyleType(req.styleType());
            }

            // COALESCE: preserve existing category scores if already set
            if (score.getAppealScore() == null) score.setAppealScore(req.appealScore());
            if (score.getJawScore()    == null) score.setJawScore(req.jawScore());
            if (score.getEyesScore()   == null) score.setEyesScore(req.eyesScore());
            if (score.getNoseScore()   == null) score.setNoseScore(req.noseScore());
            if (score.getHairScore()   == null) score.setHairScore(req.hairScore());

            if (req.photoUrl() != null && !req.photoUrl().isBlank()) score.setPhotoUrl(req.photoUrl());
        } else {
            score = UserScore.builder()
                    .userId(userId)
                    .username(username)
                    .overallScore(req.overallScore())
                    .combinedScore(combined)
                    .isPublic(req.isPublic())
                    .pslTier(req.pslTier())
                    .potentialTier(req.potentialTier())
                    .appealScore(req.appealScore())
                    .jawScore(req.jawScore())
                    .eyesScore(req.eyesScore())
                    .noseScore(req.noseScore())
                    .hairScore(req.hairScore())
                    .photoUrl(req.photoUrl())
                    .styleType(req.styleType())
                    .build();
        }

        userScoreRepository.save(score);

        // 5. Rank lookup (only meaningful if public)
        int rank = 0;
        int totalUsers = 0;
        if (req.isPublic()) {
            Object[] rankResult = userScoreRepository.findRankByUserId(userId);
            if (rankResult != null && rankResult.length >= 2) {
                rank = ((Number) rankResult[0]).intValue();
                totalUsers = ((Number) rankResult[1]).intValue();
            }
        }

        return new SubmitScoreResponse(rank, totalUsers, score.getCombinedScore());
    }

    public LeaderboardPageResponse getTopRanked(Pageable pageable) {
        Page<Object[]> page = userScoreRepository.findLeaderboard(pageable);
        return buildPageResponse(page, pageable);
    }

    public LeaderboardPageResponse search(String query, Pageable pageable) {
        // Escape SQL LIKE wildcards before passing to native query
        String escaped = query.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        Page<Object[]> page = userScoreRepository.searchByUsername(escaped, pageable);
        return buildPageResponse(page, pageable);
    }

    private LeaderboardPageResponse buildPageResponse(Page<Object[]> page, Pageable pageable) {
        List<Object[]> content = page.getContent();
        List<LeaderboardEntryDto> entries = content.stream().map(this::mapRow).toList();
        int totalUsers = content.isEmpty() ? 0 : ((Number) content.get(0)[14]).intValue();
        return new LeaderboardPageResponse(entries, pageable.getPageNumber(), entries.size(), totalUsers);
    }

    /**
     * Column order from native query:
     * 0=user_id, 1=username, 2=overall_score, 3=combined_score, 4=psl_tier, 5=potential_tier,
     * 6=appeal_score, 7=jaw_score, 8=eyes_score, 9=nose_score, 10=hair_score,
     * 11=photo_url, 12=style_type, 13=rank, 14=total_users
     */
    private LeaderboardEntryDto mapRow(Object[] row) {
        return new LeaderboardEntryDto(
                (String) row[1],
                toBigDecimal(row[2]),
                toBigDecimal(row[3]),
                ((Number) row[13]).intValue(),
                (String) row[4],
                (String) row[5],
                toBigDecimal(row[6]),
                toBigDecimal(row[7]),
                toBigDecimal(row[8]),
                toBigDecimal(row[9]),
                toBigDecimal(row[10]),
                (String) row[11],
                (String) row[12]
        );
    }

    private static BigDecimal toBigDecimal(Object obj) {
        if (obj == null) return null;
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return null;
    }

    static int tierIndex(String tier) {
        int idx = PSL_TIER_ORDER.indexOf(tier);
        return idx < 0 ? 0 : idx;
    }
}
