package com.glowmax.controller;

import com.glowmax.dto.LeaderboardDtos.*;
import com.glowmax.service.LeaderboardService;
import com.glowmax.service.RateLimitService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Validated
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final RateLimitService rateLimit;

    /**
     * GET /api/v1/leaderboard?page=0&size=100 — public.
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<LeaderboardPageResponse> getLeaderboard(
            @PageableDefault(size = 100) Pageable pageable) {
        return ResponseEntity.ok(leaderboardService.getTopRanked(pageable));
    }

    /**
     * GET /api/v1/leaderboard/search?q=...
     */
    @GetMapping("/leaderboard/search")
    public ResponseEntity<LeaderboardPageResponse> search(
            @RequestParam @NotBlank @Size(min = 1, max = 30) String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(leaderboardService.search(q, pageable));
    }

    /**
     * POST /api/v1/scores — submit score. Require auth, KHÔNG cho anonymous.
     * Rate limit: 30/giờ/user.
     */
    @PostMapping("/scores")
    public ResponseEntity<SubmitScoreResponse> submitScore(
            @AuthenticationPrincipal String userIdStr,
            @Valid @RequestBody SubmitScoreRequest body) {

        rateLimit.checkOrThrow("score:" + userIdStr, 30, Duration.ofHours(1));
        return ResponseEntity.ok(leaderboardService.submitScore(UUID.fromString(userIdStr), body));
    }
}
