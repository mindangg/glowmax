import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// Required for iOS: completes the auth session when the app is foregrounded
// after an OAuth redirect.
WebBrowser.maybeCompleteAuthSession();

// Must match the scheme in app.json + a Supabase redirect allowlist entry.
const REDIRECT_URI = 'glowmax://auth/callback';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SignInResult =
  | { ok: true;  linked: boolean }
    // linked = true  → linkIdentity succeeded: anon account merged into real
    //                   account, user_id is unchanged.
    // linked = false → existing OAuth account found: session switched to that
    //                   account (user_id changed).
  | { ok: false; error: string };

// ── signInWithProvider ────────────────────────────────────────────────────────

/**
 * Sign in with Apple or Google.
 *
 * Strategy:
 * 1. Try `linkIdentity()` — merges the current anonymous session into the real
 *    OAuth account. The user_id stays the same, so all existing data is kept.
 * 2. If the OAuth provider is already linked to a *different* Supabase user,
 *    Supabase returns an error. We fall back to `signInWithOAuth()`, which
 *    switches the session to the existing account.
 */
export async function signInWithProvider(
  provider: 'apple' | 'google',
): Promise<SignInResult> {
  try {
    // ── Attempt 1: link anonymous session to OAuth provider ──────────────────
    const { data: linkData, error: linkError } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: REDIRECT_URI, skipBrowserRedirect: true },
    });

    let oauthUrl: string;
    let isLinking = true;

    if (!linkError && linkData?.url) {
      oauthUrl = linkData.url;
    } else {
      // ── Attempt 2: OAuth provider already exists — sign in instead ──────────
      isLinking = false;
      const { data: signInData, error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: REDIRECT_URI, skipBrowserRedirect: true },
      });
      if (signInError || !signInData?.url) {
        return { ok: false, error: signInError?.message ?? 'Đăng nhập thất bại.' };
      }
      oauthUrl = signInData.url;
    }

    // ── Open the OAuth browser ────────────────────────────────────────────────
    const result = await WebBrowser.openAuthSessionAsync(oauthUrl, REDIRECT_URI);
    if (result.type !== 'success') {
      return { ok: false, error: 'Đăng nhập bị hủy.' };
    }

    // ── Exchange the auth code for a Supabase session ─────────────────────────
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
    if (exchangeError) {
      return { ok: false, error: exchangeError.message };
    }

    return { ok: true, linked: isLinking };
  } catch {
    return { ok: false, error: 'Đã xảy ra lỗi không xác định.' };
  }
}

// ── upsertProfile ─────────────────────────────────────────────────────────────

/**
 * Create or update the current user's profile row.
 * Returns { ok: false, error } if the username is already taken.
 */
export async function upsertProfile(
  username: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Phiên đăng nhập không hợp lệ.' };

  const { error } = await supabase.rpc('upsert_profile', {
    p_user_id:      user.id,
    p_username:     username,
    p_is_anonymous: user.is_anonymous ?? true,
  });

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Tên người dùng đã được sử dụng. Vui lòng chọn tên khác.' };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ── checkUsernameAvailable ────────────────────────────────────────────────────

/**
 * Returns true if the username is not taken (case-insensitive).
 * Falls back to true on network error — the DB unique constraint is the
 * authoritative guard.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_username_available', {
      p_username: username,
    });
    if (error) return true;
    return data === true;
  } catch {
    return true;
  }
}

// ── getCurrentProfile ─────────────────────────────────────────────────────────

/**
 * Fetch the profile row for the currently logged-in user.
 * Returns null if not found or not authenticated.
 */
export async function getCurrentProfile(): Promise<{
  username: string;
  is_anonymous: boolean;
} | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('username, is_anonymous')
    .eq('id', user.id)
    .single();

  return data ?? null;
}
