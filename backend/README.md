# Glowmax Backend (Spring Boot)

REST API thay thế Supabase Edge Functions cho Glowmax mobile app.

## Tech Stack

- **Spring Boot 4.0.6** + **Java 25 LTS** + **Maven**
- PostgreSQL 16 + Flyway migrations (1 file duy nhất)
- Spring Security stateless + JWT (jjwt 0.12) + nimbus-jose-jwt (verify Google/Apple ID token)
- Bucket4j in-memory (rate limiting đơn giản)
- AWS SDK v2 (S3 cho avatar) + Thumbnailator (resize ảnh)
- Lombok + Java 25 Records (giảm boilerplate, không dùng MapStruct)

## Cấu trúc thư mục (by-layer, lean ~15 file)

```
backend/src/main/java/com/glowmax/
├── GlowmaxApplication.java
├── config/
│   ├── SecurityConfig.java       JWT filter chain + CORS inline
│   ├── WebClientConfig.java      OpenAI WebClient bean
│   └── AwsS3Config.java          S3Client bean
├── controller/
│   ├── AuthController.java       /api/v1/auth/*
│   ├── ProfileController.java    /api/v1/profiles/*
│   ├── LeaderboardController.java /api/v1/leaderboard, /api/v1/scores
│   ├── AnalyzeController.java    /api/v1/analyze/*
│   └── AvatarController.java     /api/v1/avatars
├── service/
│   ├── AuthService.java          anonymous + OAuth + refresh (gộp 3 thành 1)
│   ├── JwtUtil.java              encode / decode / hash JWT
│   ├── ProfileService.java
│   ├── LeaderboardService.java
│   ├── AnalyzeService.java
│   ├── OpenAiService.java        WebClient gọi GPT-4o
│   ├── S3Service.java            upload + resize avatar
│   └── RateLimitService.java     Bucket4j in-memory (1 file, không cần config)
├── repository/
│   ├── UserRepository.java
│   ├── ProfileRepository.java
│   ├── UserScoreRepository.java  native query leaderboard + rank()
│   └── RefreshTokenRepository.java
├── entity/
│   ├── User.java
│   ├── Profile.java
│   └── UserScore.java
├── dto/
│   ├── AuthDtos.java             Records: OAuthCallbackRequest, AuthResponse, ...
│   ├── ProfileDtos.java
│   ├── LeaderboardDtos.java
│   └── AnalyzeDtos.java
├── filter/
│   └── JwtFilter.java            OncePerRequestFilter, set SecurityContext
└── exception/
    ├── BusinessException.java    Static factory: notFound, conflict, tooManyRequests...
    └── GlobalExceptionHandler.java @RestControllerAdvice, ProblemDetail (RFC 7807)

backend/src/main/resources/
├── application.yml               1 file config, tất cả secrets từ env var
└── db/migration/
    └── V1__init_schema.sql       1 migration duy nhất
```

## Setup lần đầu

### 1. Cài đặt prerequisites

- **JDK 25** (Temurin): https://adoptium.net/
- **Docker Desktop** (chạy Postgres local): https://www.docker.com/

Verify:
```bash
java --version    # phải hiện 25.x
docker --version
```

### 2. Generate Maven wrapper (1 lần, sau đó dùng `./mvnw`)

```bash
cd backend
mvn -N wrapper:wrapper -Dmaven=3.9.9
```

### 3. Tạo `.env` từ template

```bash
cp .env.example .env
# Chỉnh: DB_PASSWORD, JWT_SECRET, OPENAI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

### 4. Start Postgres local

```bash
docker compose -f docker-compose.dev.yml up -d
# Postgres chạy tại localhost:5432
# pgAdmin tại localhost:5050 (profile tools: docker compose --profile tools up -d)
```

### 5. Chạy app

```bash
./mvnw spring-boot:run
```

Endpoints kiểm tra:
- `http://localhost:8080/actuator/health` → `{"status":"UP"}`
- `http://localhost:8080/api/v1/leaderboard` → (sau khi implement)

## Build & Test

```bash
./mvnw clean verify          # compile + test (dùng H2 in-memory)
./mvnw clean package         # tạo JAR ở target/
./mvnw spring-boot:run       # chạy local
./mvnw test                  # chỉ chạy test
```

> **Test dùng H2** (không cần Docker khi test): `src/test/resources/application-test.properties`
> override datasource sang H2, tắt Flyway, dùng `ddl-auto=create-drop`.
> Khi app ổn định → migrate sang Testcontainers + Postgres thật.

## Docker build (production)

```bash
docker build -t glowmax-api:latest .
docker run -p 8080:8080 --env-file .env glowmax-api:latest
```

## Migration Status (Skeleton)

⚠️ **Toàn bộ là skeleton với TODO — bạn tự implement để học:**

- [x] Project structure + pom.xml (lean, ~10 dependencies)
- [x] application.yml (env var-based config)
- [x] V1__init_schema.sql (1 migration: users, profiles, user_scores, refresh_tokens)
- [x] Entity classes (User, Profile, UserScore, RefreshToken)
- [x] Repository interfaces (custom queries với `@Query`)
- [x] DTO files (Java Records, validation annotations)
- [x] Exception handling (BusinessException + GlobalExceptionHandler)
- [x] Filter (JwtFilter skeleton)
- [x] Controller skeletons (TODO comments với hướng dẫn)
- [x] Service skeletons (TODO comments với hướng dẫn)
- [ ] **BẠN CODE**: AuthService (anonymous, OAuth, refresh logic)
- [ ] **BẠN CODE**: JwtUtil (HS256 sign/verify, SHA-256 hash)
- [ ] **BẠN CODE**: SecurityConfig (filter chain, CORS)
- [ ] **BẠN CODE**: ProfileService, LeaderboardService, AnalyzeService
- [ ] **BẠN CODE**: OpenAiService (port từ Supabase Edge Function)
- [ ] **BẠN CODE**: S3Service (upload + Thumbnailator resize)
- [ ] **BẠN CODE**: RateLimitService (Bucket4j in-memory)

## Best Practices đã apply

| Pattern | Áp dụng ở |
|---------|-----------|
| Constructor injection (`@RequiredArgsConstructor`) | Tất cả service, controller |
| Java 25 Records cho DTO | `dto/*.java` |
| `@Transactional(readOnly = true)` ở service class | Service classes |
| Bean Validation (`@Valid`, `@NotBlank`, `@Pattern`) | DTO + controller params |
| Global exception handler → `ProblemDetail` (RFC 7807) | `GlobalExceptionHandler.java` |
| API versioning `/api/v1/` | Tất cả controller |
| Secrets qua env vars (không hardcode) | `application.yml` |
| Flyway (không dùng `ddl-auto=update` ở prod) | `V1__init_schema.sql` |
| Stateless security (không session, không CSRF) | `SecurityConfig.java` |
| Rate limiting in-process (Bucket4j) | `RateLimitService.java` |
