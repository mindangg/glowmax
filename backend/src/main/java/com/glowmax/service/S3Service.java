package com.glowmax.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;

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
        // TODO:
        //  1. BufferedImage resized = Thumbnails.of(image).size(240, 240).asBufferedImage();
        //  2. ByteArrayOutputStream baos = ...; ImageIO.write(resized, "jpeg", baos);
        //  3. String key = "leaderboard-avatars/" + userId + "/avatar.jpg";
        //  4. s3Client.putObject(PutObjectRequest.builder()
        //       .bucket(avatarBucket).key(key)
        //       .contentType("image/jpeg")
        //       .cacheControl("public, max-age=31536000").build(),
        //     RequestBody.fromBytes(baos.toByteArray()));
        //  5. return publicUrlPrefix + "/" + key;
        throw new UnsupportedOperationException("TODO");
    }

    public void deleteAvatar(UUID userId) {
        // TODO: s3Client.deleteObject(DeleteObjectRequest.builder()
        //   .bucket(avatarBucket).key("leaderboard-avatars/" + userId + "/avatar.jpg").build());
        //  Log warning nếu fail nhưng KHÔNG throw (best-effort)
        throw new UnsupportedOperationException("TODO");
    }
}
