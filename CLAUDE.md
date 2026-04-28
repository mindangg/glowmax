# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Layout

```
glowmax/
├── frontend/          React Native + Expo (app/, hooks/, lib/, components/, types/)
├── backend/           Spring Boot 4.0 + Java 25 (skeleton — services/controllers need implementing)
├── infra/             AWS infra docs, Caddy config, docker-compose.prod.yml
├── supabase/          [LEGACY] Edge Functions + migrations; being replaced by backend/
├── .github/workflows/ backend.yml — CI/CD (test + build-and-deploy to EC2)
└── docs/              ADRs, runbooks
```

**All path references below are relative to `frontend/` unless stated otherwise.**

## Commands

### Frontend (run from `frontend/`)

```bash
cd frontend

npx expo start          # dev server (Expo Go)
npm run android         # Android device/emulator
npm run ios             # iOS simulator
npm run web             # web browser

npx tsc --noEmit        # type-check (no test/lint scripts configured)

# EAS builds (requires `eas-cli` + EAS account — needed for real RevenueCat purchases)
eas build --profile development --platform ios
eas build --profile production --platform all
```

### Backend (run from `backend/`)

```bash
cd backend

# First time: generate Maven wrapper
mvn -N wrapper:wrapper -Dmaven=3.9.9

# Start Postgres locally (required before running the app)
docker compose -f docker-compose.dev.yml up -d

# Run / build / test
./mvnw spring-boot:run          # start on localhost:8080
./mvnw clean verify             # compile + run tests (H2 in-memory, no Docker needed)
./mvnw clean package            # build JAR → target/
./mvnw test                     # tests only

# Production Docker image (ARM64 for EC2 t4g.small)
docker build -t glowmax-api:latest .
```

Backend requires a `.env` file (copy from `.env.example`): `DB_PASSWORD`, `JWT_SECRET`, `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## Frontend Architecture

**Stack:** React Native 0.83.4 + Expo 55, Expo Router (file-based routing), NativeWind (Tailwind utilities), RevenueCat (subscriptions, mocked in Expo Go), Spring Boot REST API (auth + data).

**UI language:** Vietnamese throughout (labels, error messages, button text).

### Routing

`app/index.tsx` redirects immediately to `/(onboarding)`. Three route groups:
- `(onboarding)/` — 30+ screens collecting user profile data before account creation. State persisted to AsyncStorage via `useOnboarding`.
- `(main)/` — Non-premium post-signup app: home, scan, results, leaderboard, paywall, profile, my-score.
- `(premium)/` — Premium app with custom bottom tab bar (Quét / Xếp hạng / Hàng ngày / Thông tin / Tiến độ). Layout in `app/(premium)/_layout.tsx`.

Root layout (`app/_layout.tsx`) handles font loading, anonymous auth init via `ensureAnonymousAuth()`, RevenueCat setup.

### Authentication Flow

Auth has fully migrated from Supabase to the Spring Boot REST API. `lib/supabase.ts` no longer exists.

1. **App boot** — `ensureAnonymousAuth()` (`lib/auth.ts`) checks for an existing access token in SecureStore; if absent, calls `POST /api/v1/auth/anonymous` to create an anonymous user and stores the returned JWT pair.
2. **Google Sign-In** — `expo-auth-session` opens Google's OAuth browser → receives `id_token` → POSTs to `POST /api/v1/auth/oauth/google/callback` with the token and `anonymous_user_id` → backend merges the anonymous account, preserving `user_id` and data → stores new JWT pair.
3. **Token refresh** — The Axios interceptor in `lib/apiClient.ts` auto-retries on 401 using the stored refresh token (`POST /api/v1/auth/refresh`), then replays the original request.
4. Apple Sign-In is stubbed (`lib/auth.ts` returns an error message) pending Apple Developer approval.

### State Management

No Redux/Zustand — all state in custom hooks under `hooks/` using React state + AsyncStorage:
- `useOnboarding` — onboarding form answers
- `useSubscription` — trial/paid status + RevenueCat sync
- `usePhotoCapture` — camera capture + gallery import with EXIF correction
- `useTrialScan` / `useFullAnalysis` — analysis results (call Spring Boot `/api/v1/analyze/*`)
- `useLeaderboard` — ranking, score submission (`submitScore` → `/api/v1/scores`), search (`searchLeaderboard` → `/api/v1/leaderboard/search`)
- `usePSLScanAnimation` — scan screen animation state
- `useDailyTasks` — daily checklist completion state (premium)

All hooks make HTTP calls via `lib/apiClient.ts` (the central Axios instance), not directly via fetch.

### Key Libraries

- **HTTP client:** `lib/apiClient.ts` — Axios instance with `EXPO_PUBLIC_API_BASE_URL` base; request interceptor attaches Bearer token; response interceptor handles 401 auto-refresh and 429 rate-limit errors (throws with `isRateLimit: true` + `retryAfterSeconds`). Use `getApiErrorMessage()` for user-facing error strings.
- **Token storage:** `lib/tokenUtils.ts` — JWT stored in `expo-secure-store` (iOS Keychain / Android Keystore) on native, AsyncStorage on web. Exports `saveTokens`, `clearTokens`, `getAccessToken`, `getRefreshToken`, `decodeUserId`, `isAnonymousToken`, `isTokenExpired`.
- **Animations:** `react-native-reanimated` v4 + `react-native-worklets` — staggered fade-in on screen entry is the standard pattern.
- **Camera/face:** `expo-camera` for capture, `expo-face-detector` for face detection during scan.
- **Image processing:** `expo-image-manipulator` — EXIF rotation fix, crop to viewfinder ratio (~0.765), JPEG 0.85 compression.
- **Share card:** `react-native-view-shot` captures a `<ViewShot>` ref to PNG, shared via `expo-sharing` (in `my-score.tsx` and `user-score.tsx`).
- **Styling:** `StyleSheet.create` with occasional NativeWind classes; dark theme `#0A0C0E` bg + `#E8C56F` gold accent; SpaceMono monospace font (`FONTS.MONO` / `FONTS.MONO_BOLD`).

### Metrics & PSL System

`lib/metrics.ts` — 20 facial measurements (ESR, FWHR, GONIAL, etc.) with overlay type/position for scan animation.

`lib/constants.ts`:
- 7-tier PSL ranking (`PSL_TIER_ORDER`: Sub 3 → True Chang) with `PSL_TIER_COLORS`
- `RESULT_CATEGORIES` — 9 output categories (appeal, jaw, eyes, orbitals, zygos, harmony, nose, hair, skin)
- `STYLE_TYPES` — 26 style archetypes (Thư sinh, Bad boy, Old money, Techwear, etc.)
- `COLORS` / `FONTS` — design tokens

`types/index.ts` key types: `PSLResult`, `LeaderboardEntry` (includes `combined_score`, `style_type`, per-category scores), `FullAnalysisResult`.

`lib/infoContent.ts` — `INFO_SECTIONS` (22) and `INFO_CATEGORIES` (5: Skincare, Bone, Nutrition, Style, Psychology) for the premium Info tab, linked from daily tasks via `infoKey`.

**Username validation** (`app/(onboarding)/username.tsx`): 500 ms debounce; strips non-alphanumeric except `. _ -` and Vietnamese unicode; rejects SQL/HTML/control-char injection before calling `checkUsernameAvailable` → `GET /api/v1/profiles/check-username`.

**combined_score formula:** `overall_score × 7 + tier_index × 5` (max 100). Computed client-side in `useLeaderboard` for optimistic display; backend recomputes authoritatively.

### Environment Variables

In `frontend/.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=...          # legacy — still used by paywall.tsx
EXPO_PUBLIC_SUPABASE_ANON_KEY=...     # legacy — still used by paywall.tsx
EXPO_PUBLIC_API_BASE_URL=...          # Spring Boot backend (default: http://localhost:8080)
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=...
EXPO_PUBLIC_REVENUECAT_IOS_KEY=...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=...
```

## Backend Architecture (Spring Boot)

**Stack:** Spring Boot 4.0.6 + Java 25 + Maven, PostgreSQL 16 + Flyway, Spring Security stateless + JWT (jjwt 0.12) + nimbus-jose-jwt (Google/Apple ID token verification), Bucket4j in-memory rate limiting, AWS SDK v2 (S3 avatars) + Thumbnailator, Lombok + Java 25 Records.

**Status:** Skeleton with TODOs — structure and entities are complete; service/controller logic needs implementing as Supabase is migrated.

### API Endpoints

| Controller | Endpoints |
|---|---|
| `AuthController` | `POST /api/v1/auth/anonymous`, `/oauth/google/callback`, `/refresh`, `/logout` |
| `ProfileController` | `GET/PUT /api/v1/profiles/me`, `GET /api/v1/profiles/check-username` |
| `LeaderboardController` | `GET /api/v1/leaderboard`, `GET /api/v1/leaderboard/search`, `POST /api/v1/scores` |
| `AnalyzeController` | `POST /api/v1/analyze/trial`, `/analyze/full` |
| `AvatarController` | `POST /api/v1/avatars` |

### Backend Structure

```
backend/src/main/java/com/glowmax/
├── config/           SecurityConfig (JWT filter chain + CORS), WebClientConfig, AwsS3Config
├── controller/       REST controllers (skeletons with TODO guidance)
├── service/          Business logic (AuthService, JwtUtil, OpenAiService, S3Service, RateLimitService, ...)
├── repository/       Spring Data JPA (UserRepository, UserScoreRepository with leaderboard rank() queries)
├── entity/           User, Profile, UserScore (JPA entities)
├── dto/              Java 25 Records (AuthDtos, ProfileDtos, LeaderboardDtos, AnalyzeDtos)
├── filter/           JwtFilter (OncePerRequestFilter)
└── exception/        BusinessException (static factories) + GlobalExceptionHandler (RFC 7807 ProblemDetail)

backend/src/main/resources/
├── application.yml           All config via env vars
└── db/migration/V1__init_schema.sql   Single Flyway migration (users, profiles, user_scores, refresh_tokens)
```

Tests use H2 in-memory (no Docker needed). Override datasource in `src/test/resources/application-test.properties`.

## Infrastructure

Prod: EC2 t4g.small (ARM64) → Caddy (reverse proxy + auto HTTPS) → Spring Boot :8080 → Postgres :5432 (Docker, internal only) + S3 (`glowmax-leaderboard-avatars`). DNS via Cloudflare. ~$15-18/month.

CI/CD: `.github/workflows/backend.yml` — `test` job runs on every PR; `build-and-deploy` job builds ARM64 Docker image → ghcr.io → SSH deploy to EC2 on push to `main`. Requires GitHub Secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`.
