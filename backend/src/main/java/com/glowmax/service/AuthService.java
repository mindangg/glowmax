package com.glowmax.service;

import com.glowmax.dto.AuthDtos.*;
import com.glowmax.entity.RefreshToken;
import com.glowmax.entity.User;
import com.glowmax.exception.BusinessException;
import com.glowmax.repository.RefreshTokenRepository;
import com.glowmax.repository.UserRepository;
import com.glowmax.util.JwtUtil;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.JWKSourceBuilder;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Auth service — gộp anonymous + OAuth + refresh + logout (lean v2).
 *
 * Flow:
 *  • Anonymous: createAnonymous() → tạo user.is_anonymous=true + profile mặc định + tokens
 *  • OAuth: handleOAuthCallback() → verify ID token (qua nimbus-jose) → tìm/link/tạo user → tokens
 *  • Refresh: refreshTokens() → hash + lookup → cấp tokens mới (KHÔNG rotation, không revoke cũ)
 *  • Logout: revokeRefreshToken() → mark revokedAt
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final ProfileService profileService;

    @Value("${glowmax.oauth.google.client-id}")
    private String googleClientId;

    @Value("${glowmax.oauth.google.client-secret}")
    private String googleClientSecret;

    @Value("${glowmax.oauth.apple.client-id}")
    private String appleClientId;

    // ─── Anonymous ───────────────────────────────────────────────

    public AnonymousAuthResponse createAnonymous() {
        User user = userRepository.save(User.builder().anonymous(true).build());
        profileService.createDefault(user.getId());
        String accessToken = jwtUtil.generateAccessToken(user.getId(), true);
        String plainRefresh = jwtUtil.generateRefreshToken();
        refreshTokenRepository.save(RefreshToken.builder()
             .userId(user.getId())
             .tokenHash(jwtUtil.hashRefreshToken(plainRefresh))
             .expiresAt(OffsetDateTime.now().plusDays(7))
             .build());
        return new AnonymousAuthResponse(accessToken, plainRefresh, jwtUtil.getAccessTokenTtlSeconds(), user.getId());
    }

    // ─── OAuth ───────────────────────────────────────────────────

    /**
     * Handle OAuth callback (Google + Apple).
     *
     * Verify ID token với nimbus-jose-jwt:
     *  - Google: JWKS https://www.googleapis.com/oauth2/v3/certs
     *  - Apple:  JWKS https://appleid.apple.com/auth/keys
     *  - Verify: signature, iss, aud (= clientId), exp
     *
     * Linking:
     *  - Nếu tìm thấy user theo (oauth_provider, oauth_provider_user_id) → trả tokens cho user đó
     *  - Nếu chưa có nhưng có anonymousAccessToken valid → link anonymous user (set email, oauth_provider, oauth_provider_user_id, is_anonymous=false)
     *  - Nếu không cả hai → tạo new User + Profile mặc định
     */
    

    public AuthResponse handleOAuthCallback(String provider, OAuthCallbackRequest req) {
        // Verify id_token theo từng provider → lấy sub + email
        final String sub;
        final String email;

        switch (provider) {
            case "google" -> {
                GoogleClaims gc = verifyGoogleIdToken(req.idToken());
                sub   = gc.sub();
                email = gc.email();
            }
            case "apple" -> {
                AppleClaims ac = verifyAppleIdToken(req.idToken());
                sub   = ac.sub();
                email = ac.email(); // null khi user đã sign-in trước đó (Apple chỉ trả email lần đầu)
            }
            default -> throw BusinessException.badRequest("UNSUPPORTED_PROVIDER", "Provider not supported: " + provider);
        }

        // 1. Tìm user theo (provider, sub) — đã link trước đó
        Optional<User> existing = userRepository.findByOauthProviderAndOauthProviderUserId(provider, sub);
        if (existing.isPresent()) {
            User user = existing.get();
            // Apple chỉ trả email lần đầu; lưu lại nếu chưa có
            if (email != null && user.getEmail() == null) {
                user.setEmail(email);
                userRepository.save(user);
            }
            return issueTokensForOAuth(user);
        }

        // 2. Có anonymousUserId → link anonymous user thành OAuth user
        if (req.anonymousUserId() != null && !req.anonymousUserId().isBlank()) {
            try {
                UUID anonId = UUID.fromString(req.anonymousUserId());
                User anonUser = userRepository.findById(anonId)
                        .orElseThrow(() -> BusinessException.notFound("USER_NOT_FOUND", "Anonymous user not found"));

                anonUser.setEmail(email);
                anonUser.setOauthProvider(provider);
                anonUser.setOauthProviderUserId(sub);
                anonUser.setAnonymous(false);
                return issueTokensForOAuth(userRepository.save(anonUser));
            } catch (IllegalArgumentException ignored) {
                // anonymousUserId không phải UUID hợp lệ → bỏ qua, tạo user mới
            }
        }

        // 3. Tạo user mới + profile mặc định
        User newUser = userRepository.save(User.builder()
                .email(email)
                .oauthProvider(provider)
                .oauthProviderUserId(sub)
                .anonymous(false)
                .build());
        profileService.createDefault(newUser.getId());
        return issueTokensForOAuth(newUser);
    }

    public String buildOAuthAuthorizationUrl(String provider, String state) {
        // Endpoint này chỉ dùng cho Google web flow.
        // Apple Sign-In trên mobile dùng native SDK (expo-apple-authentication) — không cần URL.
        if (!"google".equals(provider)) {
            throw BusinessException.badRequest("UNSUPPORTED_PROVIDER", "Provider not supported: " + provider);
        }
        String redirectUri = URLEncoder.encode("glowmax://oauth/callback", StandardCharsets.UTF_8);
        String scope = URLEncoder.encode("openid email profile", StandardCharsets.UTF_8);
        return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?response_type=code"
                + "&client_id=" + googleClientId
                + "&redirect_uri=" + redirectUri
                + "&scope=" + scope
                + "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);
    }

    // ─── OAuth helpers ───────────────────────────────────────────

    private record GoogleClaims(String sub, String email) {}
    private record AppleClaims(String sub, String email) {}

    private GoogleClaims verifyGoogleIdToken(String idToken) {
        try {
            JWKSource<SecurityContext> keySource = JWKSourceBuilder
                    .create(URI.create("https://www.googleapis.com/oauth2/v3/certs").toURL())
                    .build();
            ConfigurableJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();
            processor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource));
            JWTClaimsSet claims = processor.process(idToken, null);

            // Verify issuer + audience
            String iss = claims.getIssuer();
            if (!"accounts.google.com".equals(iss) && !"https://accounts.google.com".equals(iss)) {
                throw BusinessException.unauthorized("INVALID_OAUTH_TOKEN", "Invalid issuer");
            }
            if (!claims.getAudience().contains(googleClientId)) {
                throw BusinessException.unauthorized("INVALID_OAUTH_TOKEN", "Invalid audience");
            }

            return new GoogleClaims(claims.getSubject(), claims.getStringClaim("email"));
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to verify Google ID token", e);
            throw BusinessException.unauthorized("INVALID_OAUTH_TOKEN", "Invalid Google ID token");
        }
    }

    private AppleClaims verifyAppleIdToken(String idToken) {
        try {
            JWKSource<SecurityContext> keySource = JWKSourceBuilder
                    .create(URI.create("https://appleid.apple.com/auth/keys").toURL())
                    .build();
            ConfigurableJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();
            processor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource));
            JWTClaimsSet claims = processor.process(idToken, null);

            if (!"https://appleid.apple.com".equals(claims.getIssuer())) {
                throw BusinessException.unauthorized("INVALID_OAUTH_TOKEN", "Invalid issuer");
            }
            if (!claims.getAudience().contains(appleClientId)) {
                throw BusinessException.unauthorized("INVALID_OAUTH_TOKEN", "Invalid audience");
            }

            // Apple chỉ trả email ở lần đăng nhập đầu tiên; những lần sau email = null
            return new AppleClaims(claims.getSubject(), claims.getStringClaim("email"));
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to verify Apple ID token", e);
            throw BusinessException.unauthorized("INVALID_OAUTH_TOKEN", "Invalid Apple ID token");
        }
    }

    private AuthResponse issueTokensForOAuth(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.isAnonymous());
        String plainRefresh = jwtUtil.generateRefreshToken();
        refreshTokenRepository.save(RefreshToken.builder()
                .userId(user.getId())
                .tokenHash(jwtUtil.hashRefreshToken(plainRefresh))
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .build());
        return new AuthResponse(accessToken, plainRefresh, jwtUtil.getAccessTokenTtlSeconds(),
                new UserInfo(user.getId(), user.getEmail(), null, user.isAnonymous()));
    }

    // ─── Refresh ─────────────────────────────────────────────────

    public AuthResponse refreshTokens(String plainRefreshToken) {
        String hash = jwtUtil.hashRefreshToken(plainRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
            .orElseThrow(() -> BusinessException.unauthorized("INVALID_TOKEN", "Invalid token"));

        if (!token.isValid())
            throw BusinessException.unauthorized("INVALID_TOKEN", "Token expired or revoked");

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> BusinessException.notFound("USER_NOT_FOUND", "User not found"));

        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.isAnonymous());
        return new AuthResponse(newAccessToken, plainRefreshToken, jwtUtil.getAccessTokenTtlSeconds(),
                new UserInfo(user.getId(), user.getEmail(), null, user.isAnonymous()));
    }

    public void revokeRefreshToken(String plainRefreshToken) {
        String hash = jwtUtil.hashRefreshToken(plainRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> BusinessException.unauthorized("INVALID_TOKEN", "Invalid token"));

        token.setRevokedAt(OffsetDateTime.now());
        refreshTokenRepository.save(token);
    }
}
