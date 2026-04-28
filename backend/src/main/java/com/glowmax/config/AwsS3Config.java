package com.glowmax.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * S3 client config.
 *
 * Credential strategy:
 *  - Local dev: env var AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
 *  - Prod EC2: IAM Instance Profile (auto qua DefaultCredentialsProvider chain)
 */
@Configuration
public class AwsS3Config {

    @Value("${glowmax.aws.region}")
    private String region;

    @Value("${glowmax.aws.access-key-id:}")
    private String accessKeyId;

    @Value("${glowmax.aws.secret-access-key:}")
    private String secretAccessKey;

    @Bean
    public S3Client s3Client() {
        // TODO:
        //  if (accessKeyId.isBlank())
        //    return S3Client.builder().region(Region.of(region)).build();   // IAM instance profile
        //  else
        //    return S3Client.builder()
        //        .region(Region.of(region))
        //        .credentialsProvider(StaticCredentialsProvider.create(
        //            AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
        //        .build();
        throw new UnsupportedOperationException("TODO");
    }
}
