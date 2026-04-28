package com.glowmax.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class ProfileDtos {

    private ProfileDtos() {}

    /** Username regex: chữ + số + . _ - + Vietnamese unicode (đồng bộ frontend) */
    public static final String USERNAME_REGEX = "^[\\p{L}\\p{N}._-]{3,30}$";

    public record UpsertProfileRequest(
            @NotBlank
            @Size(min = 3, max = 30)
            @Pattern(regexp = USERNAME_REGEX, message = "Username chỉ chứa chữ, số, dấu . _ -")
            String username
    ) {}

    public record ProfileResponse(
            UUID id,
            String username,
            boolean isAnonymous,
            OffsetDateTime createdAt
    ) {}

    public record UsernameAvailabilityResponse(
            String username,
            boolean available
    ) {}
}
