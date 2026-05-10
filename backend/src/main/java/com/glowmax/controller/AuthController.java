package com.glowmax.controller;

import com.glowmax.annotation.RateLimit;
import com.glowmax.dto.AuthDtos.*;
import com.glowmax.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/v1/auth/anonymous
     * Tạo anonymous user mới + cấp tokens. Gọi từ app boot.
     * Rate limit: 5 / IP / phút (chống bot tạo account hàng loạt).
     */
    @RateLimit(capacity = 5, window = 1, unit = ChronoUnit.MINUTES, keyType = RateLimit.KeyType.IP, keyPrefix = "anon")
    @PostMapping("/anonymous")
    public ResponseEntity<AnonymousAuthResponse> createAnonymous() {
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
