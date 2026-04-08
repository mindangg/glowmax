-- ── Seed: 10 fake users for leaderboard testing ──────────────────────────────
-- Run via: supabase db reset  OR  paste into Supabase SQL editor
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING

-- ── 1. auth.users (required so profiles FK doesn't fail) ─────────────────────
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at, is_sso_user, is_anonymous
) VALUES
  ('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user1@glowmax.test',
   '', now(), now(), now(), false, false),
  ('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user2@glowmax.test',
   '', now(), now(), now(), false, false),
  ('a1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user3@glowmax.test',
   '', now(), now(), now(), false, false),
  ('a1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user4@glowmax.test',
   '', now(), now(), now(), false, false),
  ('a1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user5@glowmax.test',
   '', now(), now(), now(), false, false),
  ('a1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user6@glowmax.test',
   '', now(), now(), now(), false, false),
  ('a1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user7@glowmax.test',
   '', now(), now(), now(), false, false),
  ('a1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user8@glowmax.test',
   '', now(), now(), now(), false, false),
  ('a1000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user9@glowmax.test',
   '', now(), now(), now(), false, false),
  ('a1000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed_user10@glowmax.test',
   '', now(), now(), now(), false, false)
ON CONFLICT (id) DO NOTHING;

-- ── 2. profiles ───────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, username, is_anonymous, created_at, updated_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'TrueChang_Vu',   false, now(), now()),
  ('a1000000-0000-0000-0000-000000000002', 'ChangKing',      false, now(), now()),
  ('a1000000-0000-0000-0000-000000000003', 'HTN_Minh',       false, now(), now()),
  ('a1000000-0000-0000-0000-000000000004', 'Glowup_Tuan',    false, now(), now()),
  ('a1000000-0000-0000-0000-000000000005', 'NormieVibes',    false, now(), now()),
  ('a1000000-0000-0000-0000-000000000006', 'LTN_Hung',       false, now(), now()),
  ('a1000000-0000-0000-0000-000000000007', 'Looksmax_Quan',  false, now(), now()),
  ('a1000000-0000-0000-0000-000000000008', 'Sub5_Bro',       false, now(), now()),
  ('a1000000-0000-0000-0000-000000000009', 'GrindingHard',   false, now(), now()),
  ('a1000000-0000-0000-0000-000000000010', 'JustStarted',    false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ── 3. user_scores (spread across all PSL tiers) ─────────────────────────────
-- True Chang (9.0-10): #1
-- Chang      (8.0-8.9): #2
-- HTN        (7.0-7.9): #3, #4
-- MTN        (6.0-6.9): #5, #6
-- LTN        (5.0-5.9): #7
-- Sub 5      (3.0-4.9): #8, #9
-- Sub 3      (0.0-2.9): #10
INSERT INTO public.user_scores (user_id, username, overall_score, is_public, created_at, updated_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'TrueChang_Vu',  9.35, true, now(), now()),
  ('a1000000-0000-0000-0000-000000000002', 'ChangKing',     8.72, true, now(), now()),
  ('a1000000-0000-0000-0000-000000000003', 'HTN_Minh',      7.81, true, now(), now()),
  ('a1000000-0000-0000-0000-000000000004', 'Glowup_Tuan',   7.14, true, now(), now()),
  ('a1000000-0000-0000-0000-000000000005', 'NormieVibes',   6.53, true, now(), now()),
  ('a1000000-0000-0000-0000-000000000006', 'LTN_Hung',      6.02, true, now(), now()),
  ('a1000000-0000-0000-0000-000000000007', 'Looksmax_Quan', 5.47, true, now(), now()),
  ('a1000000-0000-0000-0000-000000000008', 'Sub5_Bro',      4.28, true, now(), now()),
  ('a1000000-0000-0000-0000-000000000009', 'GrindingHard',  3.61, true, now(), now()),
  ('a1000000-0000-0000-0000-000000000010', 'JustStarted',   2.40, true, now(), now())
ON CONFLICT (user_id) DO NOTHING;
