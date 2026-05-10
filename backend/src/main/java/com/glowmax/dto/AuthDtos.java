package com.glowmax.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {}

    // ═══ Request ═══

    public record OAuthCallbackRequest(
            @NotBlank String idToken,        // id_token từ Google / Apple SDK (JSON: id_token)
            String state,                    // optional — chỉ dùng trong web flow
            String anonymousUserId           // optional UUID: link anon → OAuth account (JSON: anonymous_user_id)
    ) {}

    public record RefreshTokenRequest(@NotBlank String refreshToken) {}

    public record LogoutRequest(@NotBlank String refreshToken) {}

    // ═══ Response ═══

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            long expiresInSeconds,
            UserInfo user
    ) {}

    public record UserInfo(
            UUID id,
            String email,
            String username,
            boolean isAnonymous
    ) {}

    public record AnonymousAuthResponse(
            String accessToken,
            String refreshToken,
            long expiresInSeconds,
            UUID userId
    ) {}

    public record OAuthRedirectResponse(
            String authorizationUrl,
            String state
    ) {}
}
