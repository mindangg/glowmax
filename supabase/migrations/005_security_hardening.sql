-- 005_security_hardening.sql
-- Fix ownership verification in SECURITY DEFINER functions and tighten storage policy

-- Fix upsert_profile: verify caller owns the row
CREATE OR REPLACE FUNCTION public.upsert_profile(
  p_user_id      uuid,
  p_username     text,
  p_is_anonymous boolean
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.profiles (id, username, is_anonymous)
  VALUES (p_user_id, p_username, p_is_anonymous)
  ON CONFLICT (id) DO UPDATE
    SET
      username     = EXCLUDED.username,
      is_anonymous = EXCLUDED.is_anonymous,
      updated_at   = now();
END;
$$;

-- Fix upsert_user_score: verify caller owns the score row
CREATE OR REPLACE FUNCTION public.upsert_user_score(
  p_user_id        text,
  p_username       text,
  p_score          numeric,
  p_is_public      boolean,
  p_psl_tier       text    DEFAULT NULL,
  p_potential_tier text    DEFAULT NULL,
  p_appeal_score   numeric DEFAULT NULL,
  p_jaw_score      numeric DEFAULT NULL,
  p_eyes_score     numeric DEFAULT NULL,
  p_nose_score     numeric DEFAULT NULL,
  p_hair_score     numeric DEFAULT NULL,
  p_photo_url      text    DEFAULT NULL,
  p_combined_score numeric DEFAULT NULL,
  p_style_type     text    DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_user_id <> auth.uid()::text THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.user_scores (
    user_id, username, overall_score, is_public,
    psl_tier, potential_tier,
    appeal_score, jaw_score, eyes_score, nose_score, hair_score,
    photo_url, combined_score, style_type
  )
  VALUES (
    p_user_id, p_username, p_score, p_is_public,
    p_psl_tier, p_potential_tier,
    p_appeal_score, p_jaw_score, p_eyes_score, p_nose_score, p_hair_score,
    p_photo_url, p_combined_score, p_style_type
  )
  ON CONFLICT (user_id) DO UPDATE
    SET
      username        = EXCLUDED.username,
      overall_score   = GREATEST(EXCLUDED.overall_score, user_scores.overall_score),
      is_public       = EXCLUDED.is_public,
      psl_tier        = COALESCE(EXCLUDED.psl_tier,        user_scores.psl_tier),
      potential_tier  = COALESCE(EXCLUDED.potential_tier,  user_scores.potential_tier),
      appeal_score    = COALESCE(EXCLUDED.appeal_score,    user_scores.appeal_score),
      jaw_score       = COALESCE(EXCLUDED.jaw_score,       user_scores.jaw_score),
      eyes_score      = COALESCE(EXCLUDED.eyes_score,      user_scores.eyes_score),
      nose_score      = COALESCE(EXCLUDED.nose_score,      user_scores.nose_score),
      hair_score      = COALESCE(EXCLUDED.hair_score,      user_scores.hair_score),
      photo_url       = COALESCE(EXCLUDED.photo_url,       user_scores.photo_url),
      combined_score  = GREATEST(
                          COALESCE(EXCLUDED.combined_score, 0),
                          COALESCE(user_scores.combined_score, 0)
                        ),
      style_type      = COALESCE(EXCLUDED.style_type,      user_scores.style_type),
      updated_at      = now();
END;
$$;

-- Fix storage policy: restrict uploads to user's own folder
-- Convention: leaderboard-avatars/<user_id>/<filename>
DROP POLICY IF EXISTS "Auth avatar upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth avatar update" ON storage.objects;

CREATE POLICY "Auth avatar upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'leaderboard-avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Auth avatar update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'leaderboard-avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
