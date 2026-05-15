# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Layout

```
glowmax/
├── frontend/          React Native + Expo (app/, hooks/, store/, lib/, components/, types/)
├── backend/           Spring Boot 4.0 + Java 25 (fully implemented)
├── infra/             AWS infra docs, Caddy config, docker-compose.prod.yml
├── supabase/          [LEGACY] Edge Functions — replaced by backend/, do not touch
├── .github/workflows/ backend.yml — CI/CD (test + build-and-deploy to EC2)
└── docs/              ADRs, runbooks
```

**All path references below are relative to `frontend/` unless stated otherwise.**

## Commands

### Frontend (run from `frontend/`)

```bash
npx expo start          # dev server (Expo Go)
npm run android         # Android emulator
npm run ios             # iOS simulator
npx tsc --noEmit        # type-check — run this after every change (no test/lint scripts)

# EAS builds (requires eas-cli + EAS account — needed for real RevenueCat purchases)
eas build --profile development --platform ios
eas build --profile production --platform all
```

### Backend (run from `backend/`)

```bash
# First time only
mvn -N wrapper:wrapper -Dmaven=3.9.9

# Start Postgres (required before running the app)
docker compose -f docker-compose.dev.yml up -d

./mvnw spring-boot:run          # start on localhost:8080
./mvnw clean verify             # compile + run tests (H2 in-memory, no Docker needed)
./mvnw clean package            # build JAR → target/
./mvnw test                     # tests only

# Production Docker image (ARM64 for EC2 t4g.small)
docker build -t glowmax-api:latest .
```

Backend requires a `.env` file (copy from `.env.example`). Required vars: `DB_PASSWORD`, `JWT_SECRET`, `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Apple Sign-In also requires `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY_PATH` (pending Apple Developer approval).

## Frontend Architecture

**Stack:** React Native 0.83.4 + Expo 55, Expo Router (file-based routing), NativeWind (Tailwind utilities), Zustand (global state), RevenueCat (subscriptions, mocked in Expo Go), Spring Boot REST API.

**UI language:** Vietnamese throughout (labels, error messages, button text).

### Routing

`app/index.tsx` redirects immediately to `/(onboarding)`. Three route groups:
- `(onboarding)/` — 30+ screens collecting profile data before account creation. State persisted to AsyncStorage via `useOnboarding`.
- `(main)/` — Non-premium post-signup app: home, scan, results, leaderboard, paywall, profile, my-score.
- `(premium)/` — Premium app with custom bottom tab bar (Quét / Xếp hạng / Hàng ngày / Thông tin / Tiến độ).

Root layout (`app/_layout.tsx`) handles font loading, anonymous auth init via `ensureAnonymousAuth()`, RevenueCat setup.

### Authentication Flow

Auth is fully on the Spring Boot REST API. `lib/supabase.ts` does not exist.

1. **App boot** — `ensureAnonymousAuth()` (`lib/auth.ts`) checks SecureStore for an existing token; if absent, calls `POST /api/v1/auth/anonymous` and stores the returned JWT pair.
2. **Google Sign-In** — `expo-auth-session` uses `response_type=id_token` implicit flow (no PKCE, no server-side code exchange) → `POST /api/v1/auth/oauth/google/callback` with `anonymous_user_id` → backend verifies via Google JWKS → merges the anonymous account → stores new JWT pair.
3. **Apple Sign-In** — `expo-apple-authentication` → `identity_token` → `POST /api/v1/auth/oauth/apple/callback` → same merge flow. Backend fully implemented; blocked on Apple Developer approval. **Apple only returns the user's email on the very first sign-in**; subsequent sign-ins return null — the backend must store it on first sign-in.
4. **Token refresh** — Axios interceptor in `lib/apiClient.ts` auto-retries on 401 using the stored refresh token (`POST /api/v1/auth/refresh`), then replays the original request. Refresh tokens do **not** rotate — the old token stays valid until logout.

`lib/auth.ts` exports: `ensureAnonymousAuth`, `signInWithProvider`, `upsertProfile`, `checkUsernameAvailable`, `getCurrentProfile`, `signOut`.

### State Management

**Global scan state** lives in `store/scanStore.ts` (Zustand). This is a singleton — every component calling the hooks below reads from the same instance, enabling cross-tab data sharing in the premium layout.

| Hook | Backed by | Persists |
|------|-----------|----------|
| `useTrialScan` | `scanStore` | Session only |
| `useFullAnalysis` | `scanStore` | Session only |
| `usePhotoCapture` | `scanStore` (URIs) + local ref (cameraRef) | Session only |
| `useSubscription` | `useState` + AsyncStorage | ✅ Cross-session |
| `useOnboarding` | `useState` + AsyncStorage | ✅ Cross-session |
| `useLeaderboard` | No state — fetch functions only | — |
| `useDailyTasks` | `useState` + AsyncStorage | ✅ Cross-session |

`scanStore` is not persisted intentionally — scan results are always fresh per session. Photo URIs (`frontPhoto`, `sidePhoto`) are stored in `scanStore` (not AsyncStorage) to survive the camera→scan screen transition within a session.

`useSubscription` loads the cached state from AsyncStorage immediately (optimistic), then verifies async with RevenueCat. Three states exist: trial-available → trial-used-but-not-paid → active-paid. `markTrialUsed()` is irreversible.

`useDailyTasks` keys completed tasks by `daily_YYYY-MM-DD` — each date is a separate persisted Set, so old days' state is preserved without clearing.

All HTTP calls go through `lib/apiClient.ts` (central Axios instance), never fetch directly.

### Key Libraries

- **HTTP client:** `lib/apiClient.ts` — Axios with `EXPO_PUBLIC_API_BASE_URL`; request interceptor attaches Bearer token; response interceptor handles 401 auto-refresh (uses a raw axios call — not `api` — to avoid interceptor recursion; guarded by `_retried` flag to prevent loops) and 429 rate-limit errors (throws with `isRateLimit: true` + `retryAfterSeconds`). Use `getApiErrorMessage()` for user-facing strings.
- **Token storage:** `lib/tokenUtils.ts` — JWT in `expo-secure-store` on native, AsyncStorage on web. Exports `saveTokens`, `clearTokens`, `getAccessToken`, `getRefreshToken`, `decodeUserId`, `isAnonymousToken`.
- **Animations:** `react-native-reanimated` v4 + `react-native-worklets` — staggered `FadeInDown` on screen entry is the standard pattern.
- **Image processing:** `expo-image-manipulator` — EXIF rotation fix, center-crop to viewfinder ratio (~0.765), JPEG 0.85 compression.
- **Face coordinate mapping:** `lib/faceCoords.ts` — converts `NormalizedFace` landmarks (0–1 range, from VisionCamera frame processor) into screen-space `FaceCoords` for AR scan overlay positioning. `buildFaceCoords(face, imgW, imgH)` does the cover-transform math; `estimateFaceCoords` is the fallback when no face is detected. Coords are persisted via `FACE_COORDS_STORAGE_KEY` in AsyncStorage to survive the camera→scan screen transition.
- **Share card:** `react-native-view-shot` + `expo-sharing` — used in `my-score.tsx` and `user-score.tsx`.
- **Styling:** `StyleSheet.create`; dark theme `#0A0C0E` bg + `#E8C56F` gold accent; SpaceMono font via `FONTS.MONO` / `FONTS.MONO_BOLD` from `lib/constants.ts`.

### PSL / Metrics System

`lib/metrics.ts` — 20 facial measurements (ESR, FWHR, GONIAL, etc.) with overlay type/position for scan animation.

`lib/constants.ts`:
- `PSL_TIER_ORDER` — 7 tiers: Sub 3 → Sub 5 → LTN → MTN → HTN → Chang → True Chang
- `RESULT_CATEGORIES` — 9 output categories (appeal, jaw, eyes, orbitals, zygos, harmony, nose, hair, skin)
- `STYLE_TYPES` — 26 style archetypes

**`TrialResult` type** (`types/index.ts`): `{ overall_score, psl_tier, teaser }` — matches `TrialScanResponse` from backend. Does **not** contain `rank` or `total_users` (those come from `submitScore` in `useLeaderboard`).

**Analyze response field naming — snake_case everywhere.** Because Spring Boot 4.0 forces global `SNAKE_CASE` on all responses (see Gotchas), frontend types for the analyze flow use snake_case: `FullAnalysisResult.psl_result`, `ResultCategoryData.overall_score`, `MetricScore.ideal_range`, `MetricScore.display_label`. Don't write `pslResult` / `overallScore` when reading from `useFullAnalysis().results` — TypeScript will compile but the value is `undefined` at runtime.

**`combined_score` formula:** `overall_score × 7 + tier_index × 5`. Computed client-side in `useLeaderboard.submitScore` for optimistic display; backend recomputes authoritatively. Leaderboard scores **never decrease** — the backend uses `GREATEST(existing, new)` on upsert. `useLeaderboard` falls back to a hardcoded `MOCK_LEADERBOARD` on network failure to preserve UX when the DB is empty.

`lib/infoContent.ts` — `INFO_SECTIONS` (22) and `INFO_CATEGORIES` (5) for the premium Info tab, linked from daily tasks via `infoKey`.

**Username validation** (`app/(onboarding)/username.tsx`): 500 ms debounce; strips invalid chars including SQL/HTML injection; checks `GET /api/v1/profiles/check-username`.

### Environment Variables

In `frontend/.env.local`:
```
EXPO_PUBLIC_API_BASE_URL=...              # Spring Boot backend (default: http://localhost:8080)
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=...
EXPO_PUBLIC_REVENUECAT_IOS_KEY=...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=...
```

`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are no longer needed — Supabase has been fully removed.

## Backend Architecture (Spring Boot)

**Stack:** Spring Boot 4.0.6 + Java 25 + Maven, PostgreSQL 16 + Flyway, Spring Security stateless + JWT (jjwt 0.12) + nimbus-jose-jwt (Google/Apple JWKS verification), Bucket4j in-memory rate limiting, AWS SDK v2 (S3 avatars) + Thumbnailator, Lombok + Java 25 Records.

**All services are fully implemented.** Jackson is configured with `SNAKE_CASE` naming strategy in `application.yml` — Java `camelCase` fields serialize to `snake_case` JSON automatically. ⚠️ Per-class `@JsonNaming(LowerCamelCaseStrategy)` overrides on records do **not** work in Spring Boot 4.0; the global strategy always wins. See Gotchas.

Mobile app sends OAuth `id_token` directly — backend verifies signature via JWKS (no server-side code exchange needed). JWKS keys are fetched on-demand with no local cache.

When an OAuth callback arrives with `anonymousUserId`, the backend **merges** the anonymous account into the OAuth identity: the `user_id` is preserved unchanged, `is_anonymous` flips to false, and all historical scores and profile data are retained.

### API Endpoints

| Controller | Endpoints |
|---|---|
| `AuthController` | `POST /api/v1/auth/anonymous`, `/oauth/{provider}/callback` (google + apple), `/refresh`, `/logout` |
| `ProfileController` | `GET/PUT /api/v1/profiles/me`, `GET /api/v1/profiles/check-username` |
| `LeaderboardController` | `GET /api/v1/leaderboard`, `GET /api/v1/leaderboard/search`, `POST /api/v1/scores` |
| `AnalyzeController` | `POST /api/v1/analyze/trial`, `POST /api/v1/analyze/full` |
| `AvatarController` | `POST /api/v1/avatars` |

### Backend Structure

```
backend/src/main/java/com/glowmax/
├── annotation/   @RateLimit — declarative rate limiting (capacity, window, keyType USER|IP)
├── aspect/       RateLimitAspect — AOP @Around → RateLimitService.checkOrThrow()
├── config/       SecurityConfig, WebClientConfig, AwsS3Config
├── controller/   AuthController, ProfileController, LeaderboardController, AnalyzeController, AvatarController
├── service/      AuthService, ProfileService, LeaderboardService, AnalyzeService, OpenAiService, S3Service, RateLimitService, JwtUtil
├── repository/   UserRepository, UserScoreRepository (native leaderboard rank() queries), ProfileRepository, RefreshTokenRepository
├── entity/       User, Profile, UserScore, RefreshToken
├── dto/          Java 25 Records — AuthDtos, ProfileDtos, LeaderboardDtos, AnalyzeDtos
├── filter/       JwtFilter (OncePerRequestFilter)
├── util/         WebUtil.extractClientIp() — static, not a Spring bean
└── exception/    BusinessException (static factories) + GlobalExceptionHandler (RFC 7807 ProblemDetail)

backend/src/main/resources/
├── application.yml              All config via env vars
└── db/migration/V1__init_schema.sql   Flyway migration (users, profiles, user_scores, refresh_tokens)
```

Tests use H2 in-memory (no Docker needed). Datasource overridden in `src/test/resources/application-test.properties`.

### Rate Limiting

Declared with `@RateLimit` on controller methods. `RateLimitService` uses Bucket4j in-memory — buckets are keyed by `USER:{userId}` or `IP:{ip}`. On exceeded limit, throws `BusinessException` → 429 response with `Retry-After` header. Frontend interceptor in `lib/apiClient.ts` catches 429 and rethrows with `{ isRateLimit: true, retryAfterSeconds }`.

Current limits: `POST /api/v1/analyze/trial` — 3 req/day/IP; `POST /api/v1/analyze/full` — 10 req/hour/user.

Rate limiting is **in-memory only** (Bucket4j, not Redis-backed) — buckets are not shared across JVM instances. Horizontal scaling would require switching to Redis.

## Infrastructure

Prod: EC2 t4g.small (ARM64) → Caddy (reverse proxy + auto HTTPS) → Spring Boot :8080 → Postgres :5432 (Docker, internal only) + S3 (`glowmax-leaderboard-avatars`). DNS via Cloudflare. ~$15-18/month.

CI/CD: `.github/workflows/backend.yml` — `test` job on every PR; `build-and-deploy` builds ARM64 Docker image → ghcr.io → SSH deploy to EC2 on push to `main`. GitHub Secrets required: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`.

## Gotchas

### iOS EAS build: `RCT-Folly` podspec not found

**Symptom:** EAS iOS build fails at `pod install` with:
```
[!] Unable to find a specification for `RCT-Folly` depended upon by `react-native-worklets-core`
```

**Cause:** RN 0.83 ships prebuilt `ReactNativeDependencies` (Folly bundled inside the tarball — no standalone `RCT-Folly` podspec exposed). `react-native-vision-camera` v4.6 auto-installs `react-native-worklets-core` as an optional peer dep to enable Frame Processors, and worklets-core's podspec requires the standalone `RCT-Folly` pod.

**Fix:** force RN to build from source via `expo-build-properties` in `app.json`:
```json
["expo-build-properties", {
  "ios": { "deploymentTarget": "16.0", "buildReactNativeFromSource": true }
}]
```
First build is ~10–15 min slower; subsequent builds are cached. Do **not** disable Frame Processors — `lib/faceCoords.ts` depends on them for AR overlay.

### Spring Boot 4.0 split autoconfiguration into per-integration modules

**Symptom:** App starts but a third-party integration silently doesn't run, or framework beans are missing. Examples hit on this project:
- Hibernate fails `Schema validation: missing table [profiles]` — Flyway never ran.
- `No qualifying bean of type 'com.fasterxml.jackson.databind.ObjectMapper'` — Jackson autoconfig never registered.

**Cause:** Spring Boot 4.0 broke `spring-boot-autoconfigure` into separate modules per integration (`spring-boot-flyway`, `spring-boot-jackson`, `spring-boot-jackson2`, `spring-boot-jpa`, `spring-boot-security`, etc.). Pulling in just the underlying library (e.g. `flyway-core`, `jackson-databind`) no longer triggers autoconfig.

**Fix:** For every third-party integration, add the matching `org.springframework.boot:spring-boot-<integration>` module alongside the library:
- **Flyway:** add `spring-boot-flyway` (not just `flyway-core` + `flyway-database-postgresql`).
- **Jackson 2** (`com.fasterxml.jackson.*` — what this project uses): add `spring-boot-jackson2` + an explicit `jackson-databind` dep. Do **not** use `spring-boot-jackson` / `spring-boot-starter-jackson` — those are for Jackson 3 (`tools.jackson.*`); `JacksonAutoConfiguration` is `@ConditionalOnClass(tools.jackson.databind.json.JsonMapper)` and won't wire a Jackson 2 `ObjectMapper`.
- The web starter (`spring-boot-starter-web`) no longer transitively pulls Jackson — must be added explicitly.

To check whether a Spring Boot integration module exists for something, look in `~/.m2/repository/org/springframework/boot/` after a build, or grep `spring-boot-dependencies-4.0.6.pom` in the BOM.

### EAS build: lockfile out of sync with npm version

**Symptom:** `npm ci` fails with `Missing: react-native-worklets@X.Y.Z from lock file` (or similar) for packages that don't match what's in `package.json`.

**Cause:** EAS Build workers use Node 20 / npm 10; if the lockfile was generated with npm 11 (Node 22+), npm 10 may consider transitive entries missing. Also, `react-native-reanimated: ^4.x` and `react-native-worklets: ^0.x` must stay compatible — Reanimated 4.3+ requires Worklets 0.8+.

**Fix:**
1. Ensure `frontend/.npmrc` contains `legacy-peer-deps=true`
2. Regenerate the lockfile with npm 10: `npx npm@10.9.3 install --ignore-scripts` from `frontend/`
3. Keep `react-native-worklets` at `^0.8.0` or newer to match the Reanimated version resolved by `^4.2.1`

**Note:** The `EXPO_USE_PRECOMPILED_MODULES=1` warning in EAS logs is non-fatal — it's a side effect of `buildReactNativeFromSource: true` and is expected.

### Spring Boot 4.0 ignores `@JsonNaming` overrides on records

**Symptom:** A DTO record annotated with `@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)` still serializes its fields in `snake_case` (matching the global `spring.jackson.property-naming-strategy: SNAKE_CASE`). Frontend reads `data.pslResult` / `data.categories[].overallScore` and gets `undefined`, while the wire actually contains `psl_result` / `overall_score`.

**Cause:** With `spring-boot-jackson2` autoconfig in Spring Boot 4.0, the global naming strategy applied via `application.yml` wins over per-class `@JsonNaming` annotations on Java records. `@JsonNaming(SnakeCaseStrategy)` works (it agrees with the global), but `LowerCamelCaseStrategy` overrides are silently ignored.

**Fix:** Do NOT rely on `@JsonNaming(LowerCamelCaseStrategy)` to opt a DTO out of the global snake_case. Either:
- Accept the wire is snake_case everywhere and make frontend TypeScript types match (this project's choice — `FullAnalysisResult.psl_result`, `ResultCategoryData.overall_score`, `MetricScore.ideal_range` / `display_label`), OR
- Write a custom `Jackson2ObjectMapperBuilderCustomizer` bean that scopes naming per class.

Always log the wire JSON (`objectMapper.writeValueAsString(response)`) when diagnosing field-name mismatches — `cat -n` of the DTO is misleading because the annotation looks right.

### Analyze response parser tolerates both naming styles

[AnalyzeService.parseFullAnalysis](backend/src/main/java/com/glowmax/service/AnalyzeService.java) uses `firstDecimal(node, "overallScore", "overall_score", "score")` and `firstString(node, "idealRange", "ideal_range")` to read GPT-4o output. GPT tends to mirror the casing of the surrounding prompt (which uses snake_case for top-level `psl_tier` / `overall_score` and was historically mixed for nested fields). The tolerant parser absorbs that drift so prompt tweaks don't break parsing.

### OpenAI content policy refusals look like success

**Symptom:** Backend returns 502 `Invalid PSL tier: null` after a scan that took only ~2 seconds (vs the normal 15–30s). OpenAI's HTTP status is `200 OK`, `finish_reason=stop`, but `content_length=4` (the body is literally `{}`).

**Cause:** When GPT-4o refuses an image under content policy (e.g. shirtless / nudity / minors), the response shape with `response_format: json_object` is just an empty `{}` — not an error, not a refusal field. `validateFullAnalysis` then throws on the missing tier and surfaces as a generic 502.

**Fix:** [AnalyzeService.checkRefusal](backend/src/main/java/com/glowmax/service/AnalyzeService.java) runs after the OpenAI call and before parsing. If response is `<50 chars` or `{}`, it throws `PHOTO_REJECTED` (422) with a Vietnamese message instructing the user to send a frontal face photo, properly clothed, well-lit. Camera screens [(onboarding)/camera.tsx](frontend/app/(onboarding)/camera.tsx) and [camera-side.tsx](frontend/app/(onboarding)/camera-side.tsx) show a `tipText` hint ("Mặt nhìn thẳng • Đủ sáng • Mặc trang phục lịch sự") to reduce rejection rate up front.

### OpenAI analyze prompt invariants

[OpenAiService.SYSTEM_PROMPT](backend/src/main/java/com/glowmax/service/OpenAiService.java) is the contract with the model. When editing:
- **Tier names must exactly match `AnalyzeService.VALID_TIERS`**: `Sub 3, Sub 5, LTN, MTN, HTN, Chang, True Chang`. Inventing variants (e.g. "Chang-lite") causes `validateFullAnalysis` to throw `OPENAI_INVALID_RESPONSE` → 502.
- **Score scale is 0.0–10.0**, not 0–100. `combined_score = overall_score × 7 + tier_index × 5` (client-side in `useLeaderboard.submitScore`) depends on this.
- **Exactly 49 metrics across 9 categories** (`jaw=7, eyes=7, orbitals=7, zygos=7, harmony=6, nose=7, hair=4, skin=4, appeal=0`). The prompt enumerates each metric by name + position and ends with a "VALIDATION before responding" instruction. GPT-4o tends to skip metrics without this enforcement.
- **`temperature: 0.3`** (low) — output stability matters more than creativity for structured aesthetic scoring.
- **`max_tokens: 8000`** — full output is ~10K chars with all 49 metrics + descriptions + tips. Below ~6000 the response truncates mid-JSON and `finish_reason=length`. Check the `OpenAI finish_reason=... content_length=...` log line in [OpenAiService.java](backend/src/main/java/com/glowmax/service/OpenAiService.java).
