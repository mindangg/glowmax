package com.glowmax.repository;

import com.glowmax.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    @Query("SELECT p FROM Profile p WHERE LOWER(p.username) = LOWER(:username)")
    Optional<Profile> findByUsernameIgnoreCase(@Param("username") String username);

    @Query("SELECT COUNT(p) > 0 FROM Profile p WHERE LOWER(p.username) = LOWER(:username)")
    boolean existsByUsernameIgnoreCase(@Param("username") String username);
}
