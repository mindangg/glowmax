package com.glowmax.repository;

import com.glowmax.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByOauthProviderAndOauthProviderUserId(String provider, String providerUserId);
}
