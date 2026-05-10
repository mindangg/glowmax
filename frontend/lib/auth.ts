/**
 * auth.ts — Authentication helpers
 *
 * Đã migrate từ Supabase sang Spring Boot REST API.
 * Không còn phụ thuộc @supabase/supabase-js.
 *
 * Google OAuth flow:
 *   1. expo-auth-session mở browser Google → user approve → nhận id_token
 *   2. POST id_token lên backend → backend verify bằng Google JWKS
 *   3. Backend trả JWT pair (access + refresh) → lưu vào SecureStore
 *
 * Anonymous merge:
 *   Khi Google Sign-In, truyền thêm `anonymousUserId` (sub của anon JWT hiện tại)
 *   → backend link OAuth identity vào anonymous account → giữ nguyên user_id + data
 */

import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { api, getApiErrorMessage } from './apiClient';
import { saveTokens, clearTokens, getAccessToken, getRefreshToken, decodeUserId } from './tokenUtils';

// Required on iOS: đóng browser OAuth session khi app foreground lại
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs — tạo trong Google Cloud Console → Credentials
// iOS: "iOS application" client type
// Android: "Android application" client type
// Không phải "Web application" (web client dùng cho server-side flow)
const GOOGLE_CLIENT_ID_IOS     = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS ?? '';
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID ?? '';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SignInResult =
  | { ok: true;  linked: boolean }
    // linked = true  → anon account đã được merge vào OAuth account (user_id giữ nguyên)
    // linked = false → đăng nhập vào OAuth account có sẵn (không có anon session trước đó)
  | { ok: false; error: string };

// ── ensureAnonymousAuth ───────────────────────────────────────────────────────

/**
 * Gọi khi app boot (trong _layout.tsx).
 * Nếu chưa có access token → tạo anonymous user mới và lưu tokens.
 * Silent fail: nếu backend offline, app vẫn chạy (chỉ không có auth).
 */
export async function ensureAnonymousAuth(): Promise<void> {
  try {
    const existing = await getAccessToken();
    if (existing) return; // đã auth rồi, không cần làm gì

    const { data } = await api.post('/api/v1/auth/anonymous');
    await saveTokens(data.access_token, data.refresh_token);
  } catch {
    // Silent fail — app vẫn render, chỉ unauthenticated requests sẽ fail 401
  }
}

// ── signInWithProvider ────────────────────────────────────────────────────────

/**
 * Sign in with Google hoặc Apple.
 * Giữ nguyên signature với Supabase version cũ để không cần sửa UI screens.
 */
export async function signInWithProvider(
  provider: 'apple' | 'google',
): Promise<SignInResult> {
  if (provider === 'google') {
    return signInWithGoogle();
  }
  return signInWithApple();
}

async function signInWithApple(): Promise<SignInResult> {
  // Apple Sign-In chỉ khả dụng trên iOS
  if (Platform.OS !== 'ios') {
    return { ok: false, error: 'Đăng nhập Apple chỉ hỗ trợ trên iOS.' };
  }

  const isAvailable = await AppleAuthentication.isAvailableAsync();
  if (!isAvailable) {
    return { ok: false, error: 'Thiết bị không hỗ trợ Sign in with Apple.' };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const idToken = credential.identityToken;
    if (!idToken) {
      return { ok: false, error: 'Không nhận được token từ Apple.' };
    }

    const currentToken = await getAccessToken();
    const anonymousUserId = decodeUserId(currentToken);

    const { data } = await api.post('/api/v1/auth/oauth/apple/callback', {
      id_token: idToken,
      anonymous_user_id: anonymousUserId,
    });

    await saveTokens(data.access_token, data.refresh_token);
    return { ok: true, linked: !!anonymousUserId };
  } catch (err: any) {
    if (err?.code === 'ERR_REQUEST_CANCELED') {
      return { ok: false, error: 'Đăng nhập bị hủy.' };
    }
    return { ok: false, error: getApiErrorMessage(err, 'Đăng nhập Apple thất bại.') };
  }
}

async function signInWithGoogle(): Promise<SignInResult> {
  try {
    // Fetch Google's OIDC discovery document (chứa endpoints: authorization_endpoint, token_endpoint, jwks_uri...)
    const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');

    // Client ID tuỳ platform
    const clientId = Platform.OS === 'ios' ? GOOGLE_CLIENT_ID_IOS : GOOGLE_CLIENT_ID_ANDROID;
    if (!clientId) {
      return { ok: false, error: 'Google Client ID chưa được cấu hình.' };
    }

    // Redirect URI phải khớp với "Authorized redirect URIs" trong Google Cloud Console
    // Scheme "glowmax" phải khai báo trong app.json (expo.scheme = "glowmax")
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'glowmax',
      path: 'auth/callback',
    });

    // Tạo OAuth request với response_type=id_token (implicit flow)
    // Backend chỉ cần id_token để verify identity — không cần authorization code
    const request = new AuthSession.AuthRequest({
      clientId,
      redirectUri,
      scopes: ['openid', 'email', 'profile'],
      responseType: AuthSession.ResponseType.IdToken,
      usePKCE: false, // id_token implicit flow không dùng PKCE
      extraParams: {
        nonce: Math.random().toString(36).slice(2), // chống replay attack
      },
    });

    // Mở browser → user đăng nhập Google → browser redirect về app với id_token
    const result = await request.promptAsync(discovery);

    if (result.type !== 'success') {
      return { ok: false, error: 'Đăng nhập bị hủy.' };
    }

    const idToken = result.params?.id_token;
    if (!idToken) {
      return { ok: false, error: 'Không nhận được token từ Google.' };
    }

    // Lấy anonymous user ID nếu đang có anon session → backend merge account
    // anonymousUserId = null nếu user chưa bao giờ anon auth (không thường xảy ra)
    const currentToken = await getAccessToken();
    const anonymousUserId = decodeUserId(currentToken);

    // POST id_token lên backend → backend verify với Google JWKS → trả JWT pair
    const { data } = await api.post('/api/v1/auth/oauth/google/callback', {
      id_token: idToken,
      anonymous_user_id: anonymousUserId, // null = không merge; backend handle gracefully
    });

    await saveTokens(data.access_token, data.refresh_token);

    // linked = true nếu có anon account bị merge (user_id không đổi, data preserved)
    return { ok: true, linked: !!anonymousUserId };
  } catch (err) {
    return { ok: false, error: getApiErrorMessage(err, 'Đăng nhập thất bại.') };
  }
}

// ── upsertProfile ─────────────────────────────────────────────────────────────

/**
 * Tạo hoặc cập nhật profile (username) của user hiện tại.
 * Gọi sau bước onboarding username.
 */
export async function upsertProfile(
  username: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await api.put('/api/v1/profiles/me', { username });
    return { ok: true };
  } catch (err: any) {
    // 409 Conflict = username đã bị dùng (backend enforce unique constraint)
    if (err?.response?.status === 409) {
      return { ok: false, error: 'Tên người dùng đã được sử dụng. Vui lòng chọn tên khác.' };
    }
    return { ok: false, error: getApiErrorMessage(err, 'Không thể lưu tên người dùng.') };
  }
}

// ── checkUsernameAvailable ────────────────────────────────────────────────────

/**
 * Trả true nếu username chưa ai dùng (case-insensitive).
 * Fail open (trả true) khi lỗi mạng → DB unique constraint là guard cuối cùng.
 * Dùng với debounce 500ms trong username.tsx.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    const { data } = await api.get('/api/v1/profiles/check-username', {
      params: { username },
    });
    return data.available === true;
  } catch {
    return true; // Fail open
  }
}

// ── getCurrentProfile ─────────────────────────────────────────────────────────

/**
 * Lấy profile của user đang đăng nhập.
 * Trả null nếu chưa auth hoặc lỗi.
 */
export async function getCurrentProfile(): Promise<{
  username: string;
  is_anonymous: boolean;
} | null> {
  try {
    const { data } = await api.get('/api/v1/profiles/me');
    return {
      username:     data.username,
      is_anonymous: data.is_anonymous,
    };
  } catch {
    return null;
  }
}

// ── signOut ───────────────────────────────────────────────────────────────────

/**
 * Revoke refresh token trên backend + xoá tokens khỏi SecureStore.
 * Sau khi sign out, ensureAnonymousAuth() sẽ tạo anonymous session mới khi app boot lại.
 */
export async function signOut(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await api.post('/api/v1/auth/logout', { refresh_token: refreshToken });
    }
  } catch {
    // Ignore lỗi logout — clear tokens dù sao
  } finally {
    await clearTokens();
  }
}
