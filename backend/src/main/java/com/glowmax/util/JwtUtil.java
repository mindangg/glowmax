package com.glowmax.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

/**
 * JWT utility — encode/decode/verify access tokens + helpers cho refresh tokens.
 *
 * Lean v2: KHÔNG có refresh token rotation. Refresh token chỉ là random string,
 * hash SHA-256 lưu DB, valid 7 ngày.
 */
@Component
public class JwtUtil {
    @Value("${glowmax.jwt.secret}")
    private String secret;

    @Value("${glowmax.jwt.access-token-ttl-minutes}")
    private int accessTokenTtlMinutes;

    @Value("${glowmax.jwt.issuer}")
    private String issuer;

    @Value("${glowmax.jwt.audience}")
    private String audience;

    public String generateAccessToken(UUID userId, boolean isAnonymous) {
        return Jwts.builder()
                .subject(userId.toString())
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(accessTokenTtlMinutes, ChronoUnit.MINUTES)))
                .claim("isAnonymous", isAnonymous)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public Claims parseAndValidate(String token) {
        var payload =  Jwts.parser()
                .verifyWith(getSigningKey())
                .requireIssuer(issuer)
                .requireAudience(audience)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        UUID userId = UUID.fromString(payload.getSubject());
        boolean isAnonymous = payload.get("isAnonymous", Boolean.class);
        return new Claims(userId, isAnonymous);
    }

    public String generateRefreshToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashRefreshToken(String plain) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plain.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        }
        catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public long getAccessTokenTtlSeconds() {
        return accessTokenTtlMinutes * 60L;
    }

    private SecretKey getSigningKey() {
        //Decode Base64 ra byte[] rồi tạo SecretKey
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public record Claims(UUID userId, boolean isAnonymous) {}
}
