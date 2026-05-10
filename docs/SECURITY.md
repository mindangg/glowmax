# Security Reference — Glowmax

Tài liệu này mô tả toàn bộ lớp bảo mật của hệ thống, các rủi ro đã biết, và checklist trước khi deploy production.

---

## 1. Kiến trúc bảo mật tổng quan

```
Mobile App (Expo)
    │  HTTPS (TLS 1.2+, Caddy tự động gia hạn Let's Encrypt)
    ▼
Caddy reverse proxy (port 443 → 8080)
    │  Bearer JWT
    ▼
Spring Boot API
    ├── JwtFilter          → verify access token mọi request
    ├── RateLimitAspect    → @RateLimit AOP, Bucket4j in-memory
    ├── SecurityConfig     → CORS · HSTS · X-Frame-Options · no CSRF
    └── GlobalExceptionHandler → RFC 7807 ProblemDetail, no stack trace
    │
    ▼
PostgreSQL (Docker, nội bộ — không expose ra ngoài)
AWS S3 (avatars, public read)
OpenAI API
```

---

## 2. Authentication

### 2.1 JWT (Access Token)

| Thuộc tính | Giá trị |
|---|---|
| Algorithm | HS256 (jjwt 0.12) |
| TTL | 15 phút (cấu hình `JWT_ACCESS_TTL_MIN`) |
| Claims | `sub` = UUID, `iss`, `aud`, `isAnonymous` |
| Verify | `JwtUtil.parseAndValidate()` kiểm tra signature + iss + aud + exp |
| Lưu client | `expo-secure-store` (iOS Keychain / Android Keystore) |

`JWT_SECRET` phải là base64 của ít nhất 32 byte random:
```bash
openssl rand -base64 64
```

### 2.2 Refresh Token

- Client nhận plain text token; backend chỉ lưu **SHA-256 hex** (`JwtUtil.hashRefreshToken()`).
- TTL: 7 ngày. Revoke: đặt `revoked_at` trong DB.
- **KHÔNG có rotation** — khi refresh thành công, cùng refresh token được trả lại. Nếu cần rotation, thêm vào `AuthService.refreshTokens()`.

### 2.3 Anonymous Auth

`POST /api/v1/auth/anonymous` tạo user `is_anonymous=true` + profile mặc định + JWT pair.
- Rate limit: **5 request/IP/phút** (`@RateLimit` trên controller).
- Khi user Google Sign-In: backend nhận `anonymous_user_id` → link anon → OAuth account, `user_id` giữ nguyên.

### 2.4 Google OAuth (production path)

1. App dùng `expo-auth-session` implicit flow (`response_type=id_token`).
2. Backend verify `id_token` bằng **nimbus-jose-jwt** qua Google JWKS (`https://www.googleapis.com/oauth2/v3/certs`).
3. Kiểm tra: RS256 signature · `iss` = `accounts.google.com` · `aud` = `GOOGLE_CLIENT_ID`.
4. Không có server-side code exchange — backend không cần `client_secret` để verify.

### 2.5 Apple OAuth

Tương tự Google nhưng JWKS từ `https://appleid.apple.com/auth/keys`.  
Apple chỉ trả `email` lần đầu đăng nhập. Backend lưu lại khi `email != null`.  
**Hiện đang là skeleton** — chờ Apple Developer approval.

---

## 3. Rate Limiting

Được implement qua annotation `@RateLimit` (AOP) → `RateLimitService` (Bucket4j in-memory).

| Endpoint | Loại key | Giới hạn |
|---|---|---|
| `POST /api/v1/auth/anonymous` | IP | 5 / phút |
| `POST /api/v1/analyze/trial` | IP | 3 / ngày |
| `POST /api/v1/analyze/full` | User (JWT sub) | 10 / giờ |

Khi vượt giới hạn → `429 Too Many Requests` + body `RATE_LIMIT`.

Thêm rate limit cho endpoint mới:
```java
@RateLimit(capacity = 5, window = 1, unit = ChronoUnit.HOURS,
           keyType = RateLimit.KeyType.USER, keyPrefix = "my-endpoint")
```

> **Giới hạn:** Bucket4j dùng `ConcurrentHashMap` in-memory. Khi scale ngang (nhiều instance), mỗi instance có bucket riêng — tổng request có thể vượt giới hạn `capacity × số instance`. Khi cần scale, thay bằng Redis-backed Bucket4j trong `RateLimitService`.

---

## 4. HTTP Security Headers

Cấu hình trong `SecurityConfig.securityFilterChain()`:

| Header | Giá trị |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| CSRF | Disabled (stateless JWT, không có session cookie) |
| Stack trace trong response | `never` (application.yml) |

---

## 5. CORS

Cấu hình qua `CORS_ALLOWED_ORIGINS` (env var):

```
# Dev
CORS_ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:19000,glowmax://

# Prod — chỉ cho phép custom scheme của app
CORS_ALLOWED_ORIGINS=glowmax://
```

Không dùng wildcard `*` ở prod. Custom scheme `glowmax://` ngăn các web app khác call API.

---

## 6. Database

- **Schema:** Flyway quản lý, Hibernate `ddl-auto: validate` (không tự sửa schema).
- **Uniqueness:** `(oauth_provider, oauth_provider_user_id)` unique ở DB level; `LOWER(username)` unique index.
- **Cascade delete:** `profiles` và `user_scores` ON DELETE CASCADE từ `users`.
- **Refresh tokens:** chỉ lưu SHA-256 hash, không plain text.
- **Postgres không expose ra ngoài** — chỉ accessible từ container nội bộ.

---

## 7. AWS / S3

- **Production:** dùng IAM Instance Role (không cần `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`).
- **Dev:** có thể dùng IAM user với quyền tối thiểu:
  ```json
  { "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
    "Resource": "arn:aws:s3:::glowmax-leaderboard-avatars/*" }
  ```
- S3 bucket `glowmax-leaderboard-avatars` là **public read** (avatar hiển thị trên leaderboard). Không upload file nhạy cảm vào bucket này.

---

## 8. Rủi ro đã biết & hướng xử lý

### 8.1 Không có refresh token rotation
**Rủi ro:** Nếu refresh token bị đánh cắp, kẻ tấn công dùng được trong 7 ngày mà không bị phát hiện.  
**Hướng xử lý:** Implement rotation trong `AuthService.refreshTokens()` — issue token mới + revoke token cũ sau mỗi lần refresh.

### 8.2 Google OAuth dùng implicit flow (không có PKCE)
**Rủi ro:** `id_token` trong URL fragment có thể bị lộ qua Referer header hoặc browser history.  
**Hiện tại:** Chấp nhận được vì Expo Router xử lý redirect trong app container, không qua web server.  
**Hướng xử lý khi cần tăng cường:** Chuyển sang Authorization Code + PKCE (`ResponseType.Code`), backend exchange `code` → `id_token`.

### 8.3 Nonce Google OAuth không phải cryptographic random
**Rủi ro thấp:** `Math.random().toString(36)` dễ đoán hơn `crypto.getRandomValues`.  
**Hướng xử lý:** Thay bằng `Crypto.getRandomValues(new Uint8Array(16))` trong `auth.ts`.

### 8.4 `anonymousUserId` không verify bằng JWT
**Rủi ro:** Client truyền bất kỳ UUID nào trong `anonymous_user_id` để merge vào account khác.  
**Giảm thiểu hiện tại:** Backend tìm user theo UUID — nếu user đó đã có `oauth_provider`, link sẽ bị overwrite (user tìm thấy theo provider trước). Tuy nhiên vẫn có thể dùng để "nhận" data của user anon khác.  
**Hướng xử lý:** Verify `anonymous_user_id` bằng cách đọc `sub` từ current access token (nếu có trong header) thay vì nhận từ body.

### 8.5 Rate limit in-memory, không dùng Redis
Đã đề cập ở mục 3. Chỉ là vấn đề khi horizontal scale.

### 8.6 Photo gửi dưới dạng base64 trong request body
**Rủi ro:** Payload lớn, tốn bandwidth.  
**Hiện tại:** Chấp nhận — ảnh được compress (JPEG 0.85) và crop trước khi gửi.  
**Tương lai:** Upload trực tiếp lên S3 presigned URL → backend nhận S3 key thay vì base64.

---

## 9. Checklist Production Deploy

### Secrets (bắt buộc)
- [ ] `JWT_SECRET` ≥ 32 byte random (`openssl rand -base64 64`)
- [ ] `DB_PASSWORD` mạnh, không phải `changeme`
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` từ Google Cloud Console
- [ ] `OPENAI_API_KEY` hợp lệ
- [ ] `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — hoặc IAM Instance Role (khuyến nghị)

### CORS
- [ ] `CORS_ALLOWED_ORIGINS` chỉ chứa `glowmax://` (không có `localhost`)

### Database
- [ ] Postgres không bind ra `0.0.0.0` — kiểm tra `docker-compose.prod.yml`
- [ ] Flyway migration chạy thành công (`./mvnw flyway:info`)

### TLS
- [ ] Caddy đã có domain + tự động cấp cert Let's Encrypt
- [ ] HSTS hoạt động (`curl -I https://api.glowmax.codes` → thấy `Strict-Transport-Security`)

### Actuator
- [ ] Chỉ expose `health` + `info` (đã cấu hình trong `application.yml`)
- [ ] `/actuator/env`, `/actuator/beans` không accessible

### Monitoring
- [ ] `SENTRY_DSN` đã cấu hình để bắt exception production
- [ ] Log level prod: `INFO` (không phải `DEBUG` — tránh log sensitive data)

---

## 10. Endpoints không cần xác thực (public)

Danh sách các endpoint mở — cần rate limit hoặc input validation đặc biệt:

| Endpoint | Lý do public | Bảo vệ |
|---|---|---|
| `POST /api/v1/auth/anonymous` | App boot tạo anon user | 5/IP/min |
| `POST /api/v1/auth/oauth/{provider}/callback` | OAuth login | nimbus-jose verify id_token |
| `POST /api/v1/auth/refresh` | Token refresh | SHA-256 hash lookup |
| `GET /api/v1/leaderboard` | Xem bảng xếp hạng | — |
| `GET /api/v1/leaderboard/search` | Tìm kiếm | — |
| `GET /api/v1/profiles/check-username` | Kiểm tra username | DB query |
| `POST /api/v1/analyze/trial` | Trial scan | 3/IP/day |
| `GET /actuator/health` | Load balancer health check | — |
