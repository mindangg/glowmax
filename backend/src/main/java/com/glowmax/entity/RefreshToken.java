package com.glowmax.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Refresh token — lean version (KHÔNG rotation, KHÔNG audit fields).
 *
 * Logout: set revokedAt = now.
 * Cleanup expired tokens: cron hoặc trigger thủ công sau (chưa cần ngay).
 */
@Entity
@Table(name = "refresh_tokens")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;          // SHA-256 hex

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "revoked_at")
    private OffsetDateTime revokedAt;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    public boolean isValid() {
        return revokedAt == null && expiresAt.isAfter(OffsetDateTime.now());
    }
}
