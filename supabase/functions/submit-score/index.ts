import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Matches the same rules as the client:
// - First char must be a Unicode letter (Latin or Vietnamese)
// - Remaining: letters, digits, space, dot, underscore, hyphen
// - Total length: 3–30 characters
// The /u flag enables Unicode property escapes.
const USERNAME_REGEX = /^[\p{L}][\p{L}\p{N} ._-]{2,29}$/u;

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
    const { overall_score, username, is_public } = body;

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

    // ── Upsert profile (claims username) ──────────────────────────────────────
    // This will fail with a 23505 (unique_violation) if another user already
    // owns this username. We surface that as a 409 so the client can prompt
    // the user to pick a different name.
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
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Upsert score (keep the highest score ever) ────────────────────────────
    const { error: upsertError } = await supabase.rpc('upsert_user_score', {
      p_user_id:   user.id,
      p_username:  username,
      p_score:     overall_score,
      p_is_public: is_public ?? true,
    });

    if (upsertError) {
      // Fallback: direct upsert
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
