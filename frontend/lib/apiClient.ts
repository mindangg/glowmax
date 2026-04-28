/**
 * apiClient.ts — Axios instance dùng cho toàn bộ app
 *
 * Hai interceptors:
 * 1. Request  → đính kèm Bearer access token vào mọi request
 * 2. Response → auto-refresh khi 401 (token hết hạn), toast-friendly 429
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenUtils';

// Lấy base URL từ .env.local (EXPO_PUBLIC_ prefix → expose ra RN bundle)
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000, // 60s — GPT-4o analyze có thể mất ~20-30s
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Mọi request đều tự động kèm "Authorization: Bearer <token>" nếu có token.
// Không cần truyền header thủ công ở từng hook.

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
// Xử lý 3 trường hợp đặc biệt:
//   401 Unauthorized  → thử refresh token → retry request gốc 1 lần
//   429 Too Many Req  → throw error với retryAfterSeconds để UI hiện toast
//   Các lỗi khác      → forward nguyên (hook tự xử lý)

// Extend config type để thêm flag _retried (tránh infinite loop)
interface RetryConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as RetryConfig | undefined;

    // ── 401: access token hết hạn → dùng refresh token lấy token mới ──────
    if (status === 401 && config && !config._retried) {
      config._retried = true; // flag để không retry vô hạn

      try {
        const refreshToken = await getRefreshToken();

        if (refreshToken) {
          // Gọi refresh endpoint trực tiếp (không qua `api` để tránh interceptor loop)
          const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });

          // Lưu tokens mới
          await saveTokens(data.access_token, data.refresh_token ?? refreshToken);

          // Cập nhật header và retry request gốc
          config.headers.Authorization = `Bearer ${data.access_token}`;
          return api(config);
        }
      } catch {
        // Refresh thất bại (refresh token cũng hết hạn / bị revoke)
        // Clear tokens → user phải anonymous auth lại (app _layout.tsx xử lý khi next request fail)
        await clearTokens();
      }
    }

    // ── 429: rate limit → throw error có metadata để UI hiện toast ─────────
    if (status === 429) {
      const retryAfterHeader = error.response?.headers?.['x-rate-limit-retry-after-seconds'];
      const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader as string, 10) : 60;

      const rateLimitError = new Error(
        retryAfterSeconds > 0
          ? `Thao tác quá nhanh. Thử lại sau ${retryAfterSeconds}s.`
          : 'Thao tác quá nhanh. Thử lại sau.',
      ) as Error & { isRateLimit: boolean; retryAfterSeconds: number };

      rateLimitError.isRateLimit = true;
      rateLimitError.retryAfterSeconds = retryAfterSeconds;

      return Promise.reject(rateLimitError);
    }

    return Promise.reject(error);
  },
);

// Helper: lấy error message thân thiện từ ProblemDetail (RFC 7807) hoặc message chung
export function getApiErrorMessage(err: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string {
  if (!err) return fallback;
  // Custom rate limit error
  if ((err as any).isRateLimit) return (err as Error).message;
  // Axios error với ProblemDetail body
  if (axios.isAxiosError(err)) {
    return err.response?.data?.detail ?? err.response?.data?.title ?? err.message ?? fallback;
  }
  // Generic Error
  if (err instanceof Error) return err.message;
  return fallback;
}
