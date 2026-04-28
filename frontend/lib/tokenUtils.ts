/**
 * tokenUtils.ts — Helpers cho JWT token storage và decode
 *
 * Dùng SecureStore (iOS Keychain / Android Keystore) trên device,
 * AsyncStorage làm fallback trên web/tests.
 *
 * KHÔNG verify JWT signature ở đây — chỉ đọc claims client-side.
 * Backend verify signature khi nhận request; client chỉ cần đọc sub/isAnonymous.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_ACCESS  = 'glowmax_access_token';
const KEY_REFRESH = 'glowmax_refresh_token';

// ── Storage helpers (SecureStore on native, AsyncStorage on web) ──────────────

async function secureGet(key: string): Promise<string | null> {
  return Platform.OS === 'web'
    ? AsyncStorage.getItem(key)
    : SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Lưu cả access token và refresh token cùng lúc */
export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    secureSet(KEY_ACCESS, accessToken),
    secureSet(KEY_REFRESH, refreshToken),
  ]);
}

/** Xóa cả 2 tokens (logout hoặc refresh fail) */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    secureDelete(KEY_ACCESS),
    secureDelete(KEY_REFRESH),
  ]);
}

export function getAccessToken(): Promise<string | null> {
  return secureGet(KEY_ACCESS);
}

export function getRefreshToken(): Promise<string | null> {
  return secureGet(KEY_REFRESH);
}

// ── JWT decode helpers ────────────────────────────────────────────────────────

/**
 * Decode JWT payload (base64url) và parse JSON claims.
 * Returns null nếu token null / malformed.
 */
function decodePayload(token: string | null): Record<string, any> | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url → base64: thay - → + và _ → /
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Thêm padding nếu thiếu (base64 cần bội số 4 ký tự)
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);

    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * Lấy userId (claim `sub`) từ access token hiện tại.
 * Dùng để truyền `anonymousUserId` khi Google Sign-In → backend merge account.
 */
export function decodeUserId(token: string | null): string | null {
  return decodePayload(token)?.sub ?? null;
}

/**
 * Kiểm tra access token có phải anonymous user không (claim `isAnonymous`).
 * Trả true nếu token null (chưa auth) hoặc isAnonymous === true.
 */
export function isAnonymousToken(token: string | null): boolean {
  if (!token) return true;
  return decodePayload(token)?.isAnonymous === true;
}

/**
 * Kiểm tra token có hết hạn chưa (claim `exp` — Unix timestamp seconds).
 * Có buffer 30s để tránh race condition.
 */
export function isTokenExpired(token: string | null): boolean {
  const payload = decodePayload(token);
  if (!payload?.exp) return true;
  return payload.exp < (Date.now() / 1000) + 30;
}
