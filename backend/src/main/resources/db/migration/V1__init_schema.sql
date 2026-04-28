-- ════════════════════════════════════════════════════════════════
-- V1: Initial schema (lean version, single migration)
-- ────────────────────────────────────────────────────────────────
-- Tables: users, profiles, user_scores, refresh_tokens
-- KHÔNG dùng: RLS, security definer functions, view, oauth_identities table
-- (OAuth provider info embed trực tiếp vào users table cho đơn giản — 1 user = 1 OAuth provider)
-- ════════════════════════════════════════════════════════════════

-- ─── users ─────────────────────────────────────────────────────
CREATE TABLE users (
    id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email                    TEXT         UNIQUE,                 -- NULL cho anonymous
    is_anonymous             BOOLEAN      NOT NULL DEFAULT TRUE,
    oauth_provider           TEXT,                                 -- 'google' | 'apple' | NULL
    oauth_provider_user_id   TEXT,                                 -- subject từ OAuth ID token
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT users_oauth_unique UNIQUE (oauth_provider, oauth_provider_user_id)
);

CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

-- ─── profiles ──────────────────────────────────────────────────
CREATE TABLE profiles (
    id              UUID         PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username        TEXT         NOT NULL,
    is_anonymous    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT profiles_username_length CHECK (
        char_length(username) >= 3 AND char_length(username) <= 30
    )
);

-- Case-insensitive unique
CREATE UNIQUE INDEX idx_profiles_username_lower ON profiles(LOWER(username));

-- ─── user_scores ───────────────────────────────────────────────
CREATE TABLE user_scores (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    username        TEXT         NOT NULL,
    overall_score   NUMERIC(4,2) NOT NULL,
    is_public       BOOLEAN      NOT NULL DEFAULT TRUE,
    psl_tier        TEXT,
    potential_tier  TEXT,
    appeal_score    NUMERIC(4,2),
    jaw_score       NUMERIC(4,2),
    eyes_score      NUMERIC(4,2),
    nose_score      NUMERIC(4,2),
    hair_score      NUMERIC(4,2),
    photo_url       TEXT,
    combined_score  NUMERIC(6,2),
    style_type      TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT user_scores_overall_range CHECK (overall_score >= 0 AND overall_score <= 10),
    CONSTRAINT user_scores_combined_range CHECK (combined_score IS NULL OR (combined_score >= 0 AND combined_score <= 100))
);

CREATE INDEX idx_user_scores_username       ON user_scores (LOWER(username));
CREATE INDEX idx_user_scores_combined_score ON user_scores (combined_score DESC) WHERE is_public = TRUE;

-- ─── refresh_tokens (lean: KHÔNG rotation, KHÔNG audit) ────────
CREATE TABLE refresh_tokens (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash    TEXT         NOT NULL UNIQUE,                  -- SHA-256 hex
    expires_at    TIMESTAMPTZ  NOT NULL,
    revoked_at    TIMESTAMPTZ,                                    -- NULL = active
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id) WHERE revoked_at IS NULL;

-- ─── Trigger: auto-update updated_at ───────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER user_scores_updated_at
    BEFORE UPDATE ON user_scores
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
