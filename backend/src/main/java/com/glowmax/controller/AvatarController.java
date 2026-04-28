package com.glowmax.controller;

import com.glowmax.service.RateLimitService;
import com.glowmax.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/avatars")
@RequiredArgsConstructor
public class AvatarController {

    private final S3Service s3Service;
    private final RateLimitService rateLimit;

    /**
     * POST /api/v1/avatars (multipart/form-data, field "file")
     * Max size 5MB (config qua spring.servlet.multipart.max-file-size).
     * Rate limit: 10/giờ/user.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal String userIdStr,
            @RequestParam("file") MultipartFile file) {
        // TODO:
        //  rateLimit.checkOrThrow("avatar:" + userIdStr, 10, Duration.ofHours(1));
        //  Validate file:
        //    - !file.isEmpty()
        //    - file.getSize() < 5 * 1024 * 1024
        //    - contentType startsWith "image/"
        //    - magic bytes check (FFD8FF cho JPEG, 89504E47 cho PNG)
        //  String url = s3Service.uploadAvatar(UUID.fromString(userIdStr), file.getInputStream(), file.getContentType())
        //  return ok(Map.of("url", url))
        throw new UnsupportedOperationException("TODO");
    }
}
