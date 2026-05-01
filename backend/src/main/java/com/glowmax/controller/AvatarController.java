package com.glowmax.controller;

import com.glowmax.exception.BusinessException;
import com.glowmax.service.RateLimitService;
import com.glowmax.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
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
            @RequestParam("file") MultipartFile file) throws IOException {
        rateLimit.checkOrThrow("avatar:" + userIdStr, 10, Duration.ofHours(1));

        if (file.isEmpty())
            throw BusinessException.badRequest("FILE_EMPTY", "file is empty");

        if (file.getSize() > 5 * 1024 * 1024)
            throw BusinessException.badRequest("FILE_TOO_LARGE", "Max 5MB");

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
            throw BusinessException.badRequest("INVALID_TYPE", "Only images allowed");


        // magic bytes — đọc toàn bộ file 1 lần vào memory (≤5MB nên ổn)
        // Không dùng getInputStream() vì stream chỉ đọc được 1 lần
        byte[] bytes = file.getBytes();
        boolean isJpeg = bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8;
        boolean isPng  = bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
        if (!isJpeg && !isPng)
            throw BusinessException.badRequest("INVALID_IMAGE", "Only JPEG/PNG allowed");

        // upload — wrap byte[] thành stream để truyền vào S3Service
        String url = s3Service.uploadAvatar(UUID.fromString(userIdStr),
                new ByteArrayInputStream(bytes), contentType);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
