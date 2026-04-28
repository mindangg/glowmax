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
    @PostMapping("/anonymous")
    public ResponseEntity<AnonymousAuthResponse> createAnonymous(HttpServletRequest request) {
        // TODO:
        //  String ip = extractClientIp(request);  // X-Forwarded-For (Cloudflare) hoặc remoteAddr
        //  rateLimit.checkOrThrow("anon:" + ip, 5, Duration.ofMinutes(1));
        //  return ResponseEntity.ok(authService.createAnonymous());
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * GET /api/v1/auth/oauth/{provider}/authorize
     * Trả URL để client redirect tới Google/Apple.
     */
    @GetMapping("/oauth/{provider}/authorize")
    public ResponseEntity<OAuthRedirectResponse> getOAuthUrl(@PathVariable String provider) {
        // TODO:
        //  - validate provider in ['google', 'apple']
        //  - generate state random (UUID), TTL 5 phút (lưu in-memory hoặc Redis)
        //  - return new OAuthRedirectResponse(authService.buildOAuthAuthorizationUrl(provider, state), state)
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * POST /api/v1/auth/oauth/{provider}/callback
     */
    @PostMapping("/oauth/{provider}/callback")
    public ResponseEntity<AuthResponse> oauthCallback(@PathVariable String provider,
                                                       @Valid @RequestBody OAuthCallbackRequest body) {
        // TODO: authService.handleOAuthCallback(provider, body)
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * POST /api/v1/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest body) {
        // TODO: authService.refreshTokens(body.refreshToken())
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * POST /api/v1/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest body) {
        // TODO: authService.revokeRefreshToken(body.refreshToken()); return noContent
        throw new UnsupportedOperationException("TODO");
    }
}
