package com.glowmax;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test — verify Spring context loads với H2 in-memory database.
 *
 * H2 thay thế Testcontainers cho giai đoạn đầu:
 * - Đơn giản hơn (không cần Docker chạy khi test)
 * - Nhanh hơn (in-process)
 * - Flyway vẫn chạy migrations, Hibernate validate schema
 *
 * application-test.yml (hoặc test properties) cần override:
 *   spring.datasource.url=jdbc:h2:mem:testdb
 *   spring.datasource.driver-class-name=org.h2.Driver
 *   spring.flyway.enabled=false  (H2 không support PostgreSQL-specific SQL)
 *   spring.jpa.hibernate.ddl-auto=create-drop  (H2 tự tạo schema từ entities)
 *
 * Run: ./mvnw test
 *
 * TODO: Khi app stable, migrate sang Testcontainers:
 *   - Bỏ @SpringBootTest properties override
 *   - Thêm @Testcontainers + @Container PostgreSQLContainer
 *   - Flyway chạy đúng trên Postgres thật
 */
@SpringBootTest
@ActiveProfiles("test")
class GlowmaxApplicationTests {

    @Test
    void contextLoads() {
        // Empty — chỉ verify Spring context start được.
        // TODO: thêm unit/integration tests theo từng module:
        //  - AuthServiceTest: createAnonymous(), refreshTokens()
        //  - LeaderboardServiceTest: submitScore() với GREATEST logic, tierIndex()
        //  - ProfileServiceTest: isUsernameAvailable() case-insensitive
        //  - RateLimitServiceTest: checkOrThrow() reject sau khi hết quota
    }
}
