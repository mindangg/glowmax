package com.glowmax.service;

import com.glowmax.dto.LeaderboardDtos.*;
import com.glowmax.entity.UserScore;
import com.glowmax.repository.UserScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LeaderboardService {

    private final UserScoreRepository userScoreRepository;

    /** PSL tier order (đồng bộ frontend lib/constants.ts) — index dùng cho combined_score. */
    private static final List<String> PSL_TIER_ORDER = List.of(
            "Sub 3", "Sub 5", "LTN", "MTN", "HTN", "Chang", "True Chang"
    );

    /**
     * Submit / upsert score.
     *
     * Logic:
     *  1. Compute combined = overall × 7 + tierIdx × 5
     *  2. Tìm UserScore by userId:
     *      - Chưa có → insert mới
     *      - Đã có → update với GREATEST cho overall + combined; COALESCE cho category scores
     *  3. Lookup rank qua native query
     *  4. Return rank + total_users + combined
     */
    @Transactional
    public SubmitScoreResponse submitScore(UUID userId, SubmitScoreRequest req) {
        // TODO:
        //  1. ProfileService check user không anonymous (anonymous KHÔNG được submit)
        //  2. BigDecimal combined = req.overallScore().multiply(BigDecimal.valueOf(7))
        //         .add(BigDecimal.valueOf(tierIndex(req.pslTier()) * 5L));
        //  3. Optional<UserScore> existing = userScoreRepository.findByUserId(userId);
        //  4. UserScore score = existing.orElseGet(() -> UserScore.builder().userId(userId).build());
        //     score.setUsername(...) (lấy từ profile)
        //     score.setOverallScore(max(req.overallScore, score.getOverallScore))
        //     score.setCombinedScore(max(combined, score.getCombinedScore))
        //     score.setIsPublic(req.isPublic)
        //     score.setPslTier(coalesce)
        //     ... (categories, photo, style)
        //  5. userScoreRepository.save(score)
        //  6. Object[] result = userScoreRepository.findRankByUserId(userId)
        //  7. return new SubmitScoreResponse((int)result[0], (int)result[1], combined)
        throw new UnsupportedOperationException("TODO");
    }

    public LeaderboardPageResponse getTopRanked(Pageable pageable) {
        // TODO: userScoreRepository.findLeaderboard(pageable)
        //  Map từng Object[] row → LeaderboardEntryDto theo thứ tự columns trong native query
        throw new UnsupportedOperationException("TODO");
    }

    public LeaderboardPageResponse search(String query, Pageable pageable) {
        // TODO: validate query length 1-30
        //  Escape SQL wildcards % và _ trước khi LIKE: query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        //  userScoreRepository.searchByUsername(escaped, pageable)
        throw new UnsupportedOperationException("TODO");
    }

    static int tierIndex(String tier) {
        int idx = PSL_TIER_ORDER.indexOf(tier);
        return idx < 0 ? 0 : idx;
    }
}
