package com.glowmax.service;

import com.glowmax.dto.ProfileDtos.ProfileResponse;
import com.glowmax.repository.ProfileRepository;
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
    // TODO: inject UserRepository, S3Service (cho deleteAccount)

    /**
     * Tạo profile mặc định cho anonymous user mới.
     * Username tạm: "user_<8chars>" — collision rất hiếm.
     */
    @Transactional
    public ProfileResponse createDefault(UUID userId) {
        // TODO: generate username "user_" + UUID.randomUUID().toString().substring(0, 8)
        //  Build Profile{id=userId, username, anonymous=true} → save
        throw new UnsupportedOperationException("TODO");
    }

    @Transactional
    public ProfileResponse updateUsername(UUID userId, String newUsername) {
        // TODO:
        //  1. Check availability (existsByUsernameIgnoreCase) → throw conflict nếu trùng
        //  2. profileRepository.findById(userId).orElseThrow(notFound)
        //  3. setUsername, setAnonymous(false) (nếu trước anonymous thì giờ "claimed" username)
        //  4. save
        throw new UnsupportedOperationException("TODO");
    }

    public boolean isUsernameAvailable(String username) {
        return !profileRepository.existsByUsernameIgnoreCase(username);
    }

    public ProfileResponse getMine(UUID userId) {
        // TODO: findById → map ProfileResponse
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * Xoá account hoàn toàn (App Store guideline 5.1.1(v)).
     */
    @Transactional
    public void deleteAccount(UUID userId) {
        // TODO:
        //  1. s3Service.deleteAvatar(userId) (best-effort, ignore nếu không có)
        //  2. userRepository.deleteById(userId) → CASCADE xoá profile, user_scores, refresh_tokens
        throw new UnsupportedOperationException("TODO");
    }
}
