# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npx expo start

# Platform-specific
npx expo start --android
npx expo start --ios
npx expo start --web
```

There are no configured lint or test scripts. TypeScript type checking can be run via `npx tsc --noEmit`.

## Architecture

**Stack:** React Native (0.83) + Expo 55, Expo Router (file-based routing), NativeWind (Tailwind utilities), Supabase (auth + database), RevenueCat (subscriptions).

### Routing

Two route groups under `app/`:
- `(onboarding)/` — 26+ screens collecting user profile data before account creation. State persisted to AsyncStorage via `useOnboarding` hook.
- `(main)/` — Post-signup app: home, scan, results, leaderboard, profile, paywall.

Root layout (`app/_layout.tsx`) handles font loading, anonymous Supabase session initialization, RevenueCat setup, and OAuth deep-link callbacks (`glowmax://auth/callback`).

### Authentication Flow

Users start with an **anonymous** Supabase session. OAuth sign-in (Apple/Google) attempts `linkIdentity()` first to merge into the existing anonymous account (preserving `user_id`), then falls back to `signInWithOAuth()`. See `lib/auth.ts` and `lib/supabase.ts`.

### State Management

No Redux/Zustand. All state lives in custom hooks under `hooks/` using React state + AsyncStorage:
- `useOnboarding` — onboarding form answers
- `useSubscription` — trial/paid status + RevenueCat sync
- `usePhotoCapture` — camera capture + gallery import with EXIF correction
- `useTrialScan` / `useFullAnalysis` — analysis results
- `useLeaderboard` — ranking and score submission
- `usePSLScanAnimation` — scan screen animation state

### Supabase RPC Functions

Backend-side functions the client calls:
- `upsert_profile(p_user_id, p_username, p_is_anonymous)`
- `is_username_available(p_username)`
- `submit_score(overall_score, username, is_public)`
- `trial-scan(photo)` — limited free analysis
- `analyze-face(photo)` — full premium analysis (10 categories)

### Key Libraries

- **Animations:** `react-native-reanimated` v4 — staggered fade-in on screen entry is the standard pattern
- **Gestures:** `react-native-gesture-handler` — back navigation
- **Image processing:** `expo-image-manipulator` — EXIF rotation fix, crop to viewfinder ratio (~0.765), JPEG 0.85 compression
- **Styling:** Mostly `StyleSheet.create` with occasional NativeWind classes; dark theme with `#0A0C0E` background and `#E8C56F` gold accent; SpaceMono monospace font

### Metrics & PSL System

`lib/metrics.ts` defines 20 facial measurements (e.g., ESR, FWHR, GONIAL), each with overlay type and position for the scan animation. `lib/constants.ts` contains the 7-tier PSL ranking system (Sub 3 → True Chang) with color mappings.

### RevenueCat

The SDK is **mocked** (`lib/revenueCat.ts`) for Expo Go compatibility. Real purchases require an EAS build.

### Environment Variables

Stored in `.env.local` (Supabase public keys, safe to expose):
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## File Structure
```
app/
  (onboarding)/       26 screens collecting profile data pre-signup
  (main)/             Post-signup app
    index.tsx         Home
    scan.tsx          Camera + scan flow
    results.tsx       Results overview
    results/          Results sub-screens
    leaderboard.tsx
    paywall.tsx
    profile.tsx
  index.tsx           Root redirect
  _layout.tsx         Font loading, Supabase anon session, RevenueCat, OAuth deep-links

components/
  ui/                 Shared primitives (FrostedButton, OptionCard, ScrollPicker, etc.)
  scan/               Scan overlays and progress UI
  results/            PSLCard, MetricRow, AppealCard, ResultCard
  backgrounds/        GrainBackground, TrailBackground

hooks/                All state lives here (no Redux/Zustand)
lib/                  auth.ts, supabase.ts, revenueCat.ts, metrics.ts, constants.ts
types/index.ts        Shared TypeScript types
supabase/
  functions/          Edge functions: analyze-face, submit-score
  migrations/         SQL migrations
```
