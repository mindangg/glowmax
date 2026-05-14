package com.glowmax;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Glowmax Backend API entry point.
 *
 * Lean v2: chỉ @SpringBootApplication. Bỏ:
 *  - @EnableJpaAuditing (DB trigger lo updated_at)
 *  - @EnableCaching (chưa cần cache)
 *  - @EnableAsync, @EnableScheduling (chưa dùng)
 *
 * Add lại khi thực sự cần (vd: thêm method @Cacheable, @Scheduled).
 */
@SpringBootApplication
public class GlowmaxApplication {

    public static void main(String[] args) {
        SpringApplication.run(GlowmaxApplication.class, args);
    }
}
