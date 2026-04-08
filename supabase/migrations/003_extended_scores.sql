-- 003_extended_scores.sql
-- Extend user_scores with PSL tier, category scores, photo URL, and combined ranking score

ALTER TABLE public.user_scores
  ADD COLUMN IF NOT EXISTS psl_tier        text,
  ADD COLUMN IF NOT EXISTS potential_tier  text,
  ADD COLUMN IF NOT EXISTS appeal_score    numeric(4,2),
  ADD COLUMN IF NOT EXISTS jaw_score       numeric(4,2),
  ADD COLUMN IF NOT EXISTS eyes_score      numeric(4,2),
  ADD COLUMN IF NOT EXISTS nose_score      numeric(4,2),
  ADD COLUMN IF NOT EXISTS hair_score      numeric(4,2),
  ADD COLUMN IF NOT EXISTS photo_url       text,
  ADD COLUMN IF NOT EXISTS combined_score  numeric(6,2);

-- Index for fast username search
CREATE INDEX IF NOT EXISTS idx_user_scores_username
  ON public.user_scores (username);

-- Recreate leaderboard view: rank by combined_score (0–100)
-- combined_score = overall_score * 7 + tier_index * 5  (max 70 + 30 = 100)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  username,
  overall_score,
  COALESCE(combined_score, overall_score * 7)           AS combined_score,
  psl_tier,
  potential_tier,
  appeal_score,
  jaw_score,
  eyes_score,
  nose_score,
  hair_score,
  photo_url,
  rank()   OVER (ORDER BY COALESCE(combined_score, overall_score * 7) DESC)::int AS rank,
  count(*) OVER ()::int                                                            AS total_users
FROM public.user_scores
WHERE is_public = true;

-- Update upsert function to store extended fields
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
  p_combined_score numeric DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_scores (
    user_id, username, overall_score, is_public,
    psl_tier, potential_tier,
    appeal_score, jaw_score, eyes_score, nose_score, hair_score,
    photo_url, combined_score
  )
  VALUES (
    p_user_id, p_username, p_score, p_is_public,
    p_psl_tier, p_potential_tier,
    p_appeal_score, p_jaw_score, p_eyes_score, p_nose_score, p_hair_score,
    p_photo_url, p_combined_score
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
      updated_at      = now();
END;
$$;

-- Storage bucket for leaderboard avatar thumbnails (public read)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('leaderboard-avatars', 'leaderboard-avatars', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public avatar read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'leaderboard-avatars');

CREATE POLICY "Auth avatar upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'leaderboard-avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Auth avatar update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'leaderboard-avatars' AND auth.uid() IS NOT NULL);
