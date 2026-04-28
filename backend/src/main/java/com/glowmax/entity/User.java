package com.glowmax.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * User entity — anonymous hoặc OAuth-linked.
 *
 * Lean v2: OAuth provider info embed thẳng vào user (1 user = 1 OAuth provider).
 * Nếu sau này cần multi-provider → tách thành bảng oauth_identities riêng.
 */
@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(unique = true)
    private String email;

    @Column(name = "is_anonymous", nullable = false)
    private boolean anonymous;

    @Column(name = "oauth_provider")
    private String oauthProvider;          // 'google' | 'apple' | null

    @Column(name = "oauth_provider_user_id")
    private String oauthProviderUserId;    // subject từ OAuth ID token

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false)
    private OffsetDateTime updatedAt;
    // updated_at auto-set bởi DB trigger (V1 migration), JPA chỉ đọc
}
