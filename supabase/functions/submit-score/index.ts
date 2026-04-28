import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const USERNAME_REGEX = /^[\p{L}][\p{L}\p{N} ._-]{2,29}$/u;

// PSL tier order for combined_score calculation (index × 5 = tier points, max 30)
const PSL_TIER_ORDER = ['Sub 3', 'Sub 5', 'LTN', 'MTN', 'HTN', 'Chang', 'True Chang'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Authenticate ──────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Validate inputs ───────────────────────────────────────────────────────
    const body = await req.json();
    const {
      overall_score,
      username,
      is_public,
      psl_tier,
      potential_tier,
      appeal_score,
      jaw_score,
      eyes_score,
      nose_score,
      hair_score,
      photo_url,
    } = body;

    if (!USERNAME_REGEX.test(username ?? '')) {
      return new Response(JSON.stringify({ error: 'Invalid username' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof overall_score !== 'number' || overall_score < 0 || overall_score > 10) {
      return new Response(JSON.stringify({ error: 'Invalid score' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Calculate combined_score (0–100) ──────────────────────────────────────
    // overall_score (0–10) × 7 = max 70 points
    // tier_index (0–6) × 5 = max 30 points
    const tierIndex = PSL_TIER_ORDER.indexOf(psl_tier ?? '');
    const tierPoints = tierIndex >= 0 ? tierIndex * 5 : 0;
    const combined_score = parseFloat((overall_score * 7 + tierPoints).toFixed(2));

    // ── Upsert profile (claims username) ──────────────────────────────────────
    const { error: profileError } = await supabase.rpc('upsert_profile', {
      p_user_id:      user.id,
      p_username:     username,
      p_is_anonymous: user.is_anonymous ?? true,
    });

    if (profileError) {
      if (profileError.code === '23505') {
        return new Response(JSON.stringify({ error: 'Username already taken' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Profile update failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Upsert score with extended fields ─────────────────────────────────────
    const { error: upsertError } = await supabase.rpc('upsert_user_score', {
      p_user_id:        user.id,
      p_username:       username,
      p_score:          overall_score,
      p_is_public:      is_public ?? true,
      p_psl_tier:       psl_tier ?? null,
      p_potential_tier: potential_tier ?? null,
      p_appeal_score:   typeof appeal_score === 'number' ? appeal_score : null,
      p_jaw_score:      typeof jaw_score === 'number' ? jaw_score : null,
      p_eyes_score:     typeof eyes_score === 'number' ? eyes_score : null,
      p_nose_score:     typeof nose_score === 'number' ? nose_score : null,
      p_hair_score:     typeof hair_score === 'number' ? hair_score : null,
      p_photo_url:      photo_url ?? null,
      p_combined_score: combined_score,
    });

    if (upsertError) {
      // Fallback: direct upsert (older schema)
      await supabase.from('user_scores').upsert(
        {
          user_id:       user.id,
          username,
          overall_score,
          is_public:     is_public ?? true,
          updated_at:    new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: false },
      );
    }

    // ── Return rank ───────────────────────────────────────────────────────────
    const { data: rankData } = await supabase
      .from('leaderboard')
      .select('rank, total_users')
      .eq('username', username)
      .single();

    return new Response(
      JSON.stringify({ rank: rankData?.rank ?? null, total_users: rankData?.total_users ?? null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
