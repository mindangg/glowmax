package com.glowmax.service;

import com.glowmax.exception.BusinessException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Rate limit service — Bucket4j in-memory mode.
 *
 * Lean v2: 1 file duy nhất, hardcode limits ở controller (không có enum/config phức tạp).
 *
 * Usage trong controller:
 *   rateLimit.checkOrThrow("analyze:" + userId, 10, Duration.ofHours(1));
 *
 * Khi scale ngang (nhiều instance) → thay ConcurrentHashMap bằng Redis-backed Bucket4j.
 *
 * Memory leak warning: bucket cache grow theo số unique key. Cần cleanup job định kỳ
 * khi có nhiều user — TODO sau (vd: @Scheduled clear bucket idle >1h).
 */
@Service
public class RateLimitService {

    private final ConcurrentMap<String, Bucket> cache = new ConcurrentHashMap<>();

    /**
     * Check + consume 1 token. Throw 429 nếu hết bucket.
     *
     * @param key      Unique cache key (vd "analyze:userId" hoặc "anon:ip")
     * @param capacity Số request tối đa trong window
     * @param window   Thời gian refill toàn bộ bucket
     */
    public void checkOrThrow(String key, int capacity, Duration window) {
        // TODO:
        //  Bucket bucket = cache.computeIfAbsent(key, k ->
        //      Bucket.builder()
        //          .addLimit(Bandwidth.simple(capacity, window))
        //          .build());
        //  if (!bucket.tryConsume(1)) {
        //      throw BusinessException.tooManyRequests("RATE_LIMIT",
        //          "Bạn đang thao tác quá nhanh, vui lòng thử lại sau");
        //  }
        throw new UnsupportedOperationException("TODO");
    }
}
