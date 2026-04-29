package com.glowmax.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Profile — username + public profile data.
 * Shared PK với User (1-1).
 */
@Entity
@Table(name = "profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Profile {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;                    // = users.id

    @Column(nullable = false)
    private String username;

    @Column(name = "is_anonymous", nullable = false)
    private boolean anonymous;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false)
    private OffsetDateTime updatedAt;

    public Object is() {
        return null;
    }
}
