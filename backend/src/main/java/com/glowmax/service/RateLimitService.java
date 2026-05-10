package com.glowmax.service;

import com.glowmax.exception.BusinessException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

/**
 * Rate limit service — Bucket4j in-memory mode.
 *
 * Không gọi trực tiếp từ controller — dùng @RateLimit annotation thay thế.
 * RateLimitAspect intercept và delegate về đây.
 *
 * Khi scale ngang (nhiều instance) → thay ConcurrentHashMap bằng Redis-backed Bucket4j.
 */
@Service
public class RateLimitService {

    private record Entry(Bucket bucket, Instant lastAccessed) {}

    private final ConcurrentMap<String, Entry> cache = new ConcurrentHashMap<>();

    private static final Duration IDLE_TTL = Duration.ofHours(1);

    public void checkOrThrow(String key, int capacity, Duration window) {
        Entry entry = cache.compute(key, (k, existing) -> {
            Bucket bucket = (existing != null)
                    ? existing.bucket()
                    : Bucket.builder()
                            .addLimit(Bandwidth.builder().capacity(capacity).refillGreedy(capacity, window).build())
                            .build();
            return new Entry(bucket, Instant.now());
        });

        if (!entry.bucket().tryConsume(1)) {
            throw BusinessException.tooManyRequests("RATE_LIMIT",
                    "Bạn đang thao tác quá nhanh, vui lòng thử lại sau");
        }
    }

    /** Xóa bucket không được dùng quá IDLE_TTL — chạy mỗi 10 phút */
    @Scheduled(fixedDelay = 10, timeUnit = TimeUnit.MINUTES)
    void evictStaleBuckets() {
        Instant cutoff = Instant.now().minus(IDLE_TTL);
        cache.entrySet().removeIf(e -> e.getValue().lastAccessed().isBefore(cutoff));
    }
}
