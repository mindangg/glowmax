package com.glowmax.controller;

import com.glowmax.dto.ProfileDtos.*;
import com.glowmax.service.ProfileService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
@Validated
public class ProfileController {

    private final ProfileService profileService;

    /**
     * GET /api/v1/profiles/check-username?username=xxx
     * Public — RN dùng để debounce check khi user gõ.
     */
    @GetMapping("/check-username")
    public ResponseEntity<UsernameAvailabilityResponse> checkUsername(
            @RequestParam @NotBlank String username) {
        return ResponseEntity.ok(new UsernameAvailabilityResponse(username, profileService.isUsernameAvailable(username)));
    }

    /**
     * GET /api/v1/profiles/me
     */
    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMine(@AuthenticationPrincipal String userIdStr) {
        return ResponseEntity.ok(profileService.getMine(UUID.fromString(userIdStr)));
    }

    /**
     * PUT /api/v1/profiles/me — update username.
     */
    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMine(@AuthenticationPrincipal String userIdStr,
                                                       @Valid @RequestBody UpsertProfileRequest body) {
        return ResponseEntity.ok(profileService.updateUsername(UUID.fromString(userIdStr), body.username()));
    }

    /**
     * DELETE /api/v1/profiles/me — App Store BẮT BUỘC.
     */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMine(@AuthenticationPrincipal String userIdStr) {
        profileService.deleteAccount(UUID.fromString(userIdStr));
        return ResponseEntity.noContent().build();
    }
}
