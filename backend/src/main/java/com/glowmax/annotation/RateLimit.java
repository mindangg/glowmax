package com.glowmax.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.time.temporal.ChronoUnit;

/**
 * Declarative rate limiting — đặt trực tiếp trên controller method.
 *
 * Ví dụ:
 *   @RateLimit(capacity = 10, window = 1, unit = HOURS, keyType = USER, keyPrefix = "analyze")
 *   @RateLimit(capacity = 5,  window = 1, unit = MINUTES, keyType = IP,   keyPrefix = "anon")
 *
 * RateLimitAspect tự build key = keyPrefix + ":" + (userId hoặc IP) rồi gọi RateLimitService.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

    /** Số request tối đa trong mỗi window */
    int capacity();

    /** Độ dài time window */
    long window();

    /** Đơn vị time window (default: HOURS) */
    ChronoUnit unit() default ChronoUnit.HOURS;

    /** Loại key dùng để phân biệt request */
    KeyType keyType() default KeyType.USER;

    /** Prefix cho cache key — nên unique per endpoint (vd: "analyze", "trial", "anon") */
    String keyPrefix();

    enum KeyType {
        /** Key = keyPrefix + ":" + userId (từ JWT principal) */
        USER,
        /** Key = keyPrefix + ":" + client IP (qua X-Forwarded-For / RemoteAddr) */
        IP
    }
}
