package com.glowmax.service;

import com.glowmax.dto.ProfileDtos.ProfileResponse;
import com.glowmax.entity.Profile;
import com.glowmax.exception.BusinessException;
import com.glowmax.repository.ProfileRepository;
import com.glowmax.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    private ProfileResponse toResponse(Profile profile) {
        return new ProfileResponse(profile.getId(), profile.getUsername(),
                profile.isAnonymous(), profile.getCreatedAt());
    }

    /**
     * Tạo profile mặc định cho anonymous user mới.
     * Username tạm: "user_<8chars>" — collision rất hiếm.
     */
    @Transactional
    public ProfileResponse createDefault(UUID userId) {
        Profile profile = Profile.builder()
                .id(userId)
                .username("user_" + userId.toString().substring(0, 8))
                .anonymous(true)
                .build();
        profileRepository.save(profile);

        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse updateUsername(UUID userId, String newUsername) {
        var existUsername = profileRepository.existsByUsernameIgnoreCase(newUsername);
        if (existUsername) {
            throw BusinessException.badRequest("USERNAME_TAKEN", "Username is already in use");
        }

        var profile = profileRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("USER_NOT_FOUND", "User not found"));

        profile.setUsername(newUsername);
        profile.setAnonymous(false);
        profileRepository.save(profile);

        return toResponse(profile);
    }

    public boolean isUsernameAvailable(String username) {
        return !profileRepository.existsByUsernameIgnoreCase(username);
    }

    public ProfileResponse getMine(UUID userId) {
        var profile = profileRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("USER_NOT_FOUND", "User not found"));

        return toResponse(profile);
    }

    /**
     * Xoá account hoàn toàn (App Store guideline 5.1.1(v)).
     */
    @Transactional
    public void deleteAccount(UUID userId) {
        s3Service.deleteAvatar(userId);
        userRepository.deleteById(userId);
    }
}
