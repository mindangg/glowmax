package com.glowmax.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.UUID;

/**
 * S3 service — upload + delete avatar.
 * Path: leaderboard-avatars/{userId}/avatar.jpg
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${glowmax.aws.s3-avatar-bucket}")
    private String avatarBucket;

    @Value("${glowmax.aws.s3-avatar-public-url-prefix}")
    private String publicUrlPrefix;

    public String uploadAvatar(UUID userId, InputStream image, String contentType) {
        // resize ảnh ra 240 x 240 rồi ghi ra bytes
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try{
            BufferedImage resized = Thumbnails.of(image).size(240, 240).asBufferedImage();
            ImageIO.write(resized, "jpeg", baos);
        }
        catch (Exception e) {
            throw new RuntimeException("Avatar upload failed", e);
        }

        String key = "leaderboard-avatars/" + userId + "/avatar.jpg";
        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(avatarBucket).key(key)
                .contentType("image/jpeg")
                .cacheControl("public, max-age=31536000").build(),
            RequestBody.fromBytes(baos.toByteArray()));

        return publicUrlPrefix + "/" + key;
    }

    public void deleteAvatar(UUID userId) {
        try {
            s3Client.deleteObject(b -> b.bucket(avatarBucket)
                    .key("leaderboard-avatars/" + userId + "/avatar.jpg"));
        }
        catch (Exception e) {
            log.warn("Failed to delete avatar for user {} (best-effort): {}", userId, e.getMessage());
        }
    }
}
