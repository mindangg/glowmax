package com.glowmax.controller;

import com.glowmax.dto.AuthDtos.*;
import com.glowmax.service.AuthService;
import com.glowmax.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimit;

    /**
     * POST /api/v1/auth/anonymous
     * Tạo anonymous user mới + cấp tokens. Gọi từ app boot.
     * Rate limit: 5 / IP / phút (chống bot tạo account hàng loạt).
     */
    private String extractClientIp(HttpServletRequest request) {
        if (request.getHeader("X-Forwarded-For") != null) {
            return request.getHeader("X-Forwarded-For").split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/anonymous")
    public ResponseEntity<AnonymousAuthResponse> createAnonymous(HttpServletRequest request) {
        String ip = extractClientIp(request);
        rateLimit.checkOrThrow("anon:" + ip, 5, Duration.ofMinutes(1));
        return ResponseEntity.ok(authService.createAnonymous());
    }

    /**
     * GET /api/v1/auth/oauth/{provider}/authorize
     * Trả URL để client redirect tới Google/Apple.
     */
    @GetMapping("/oauth/{provider}/authorize")
    public ResponseEntity<OAuthRedirectResponse> getOAuthUrl(@PathVariable String provider) {
        String state = UUID.randomUUID().toString();
        return ResponseEntity.ok(new OAuthRedirectResponse(authService.buildOAuthAuthorizationUrl(provider, state), state));
    }

    // POST /api/v1/auth/oauth/{provider}/callback
    @PostMapping("/oauth/{provider}/callback")
    public ResponseEntity<AuthResponse> oauthCallback(@PathVariable String provider,
                                                       @Valid @RequestBody OAuthCallbackRequest body) {
        return ResponseEntity.ok(authService.handleOAuthCallback(provider, body));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest body) {
        return ResponseEntity.ok(authService.refreshTokens(body.refreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest body) {
        authService.revokeRefreshToken(body.refreshToken());
        return ResponseEntity.noContent().build();
    }
}
