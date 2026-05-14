import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { api, getApiErrorMessage } from '../lib/apiClient';
import { PSL_TIER_ORDER } from '../lib/constants';
import { LeaderboardEntry } from '../types';

// Mock fallback khi DB trống hoặc backend chưa chạy
const TEST_USER_URI = Image.resolveAssetSource(require('../assets/images/face.png')).uri;

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { username: 'glowmax',    overall_score: 8.9, combined_score: 97, rank: 1,  total_users: 1247, psl_tier: 'True Chang', potential_tier: 'True Chang', appeal_score: 9.1, jaw_score: 8.7, eyes_score: 8.9, nose_score: 8.4, hair_score: 8.2, photo_url: TEST_USER_URI, style_type: 'Old money' },
  { username: 'striker99',  overall_score: 8.5, combined_score: 89, rank: 2,  total_users: 1247, psl_tier: 'Chang',      potential_tier: 'True Chang', appeal_score: 8.6, jaw_score: 8.3, eyes_score: 8.5, nose_score: 8.2, hair_score: 8.9, photo_url: undefined,      style_type: 'Bad boy'  },
  { username: 'hieunguyen', overall_score: 7.9, combined_score: 80, rank: 3,  total_users: 1247, psl_tier: 'HTN',        potential_tier: 'Chang',      appeal_score: 8.0, jaw_score: 7.8, eyes_score: 8.2, nose_score: 7.6, hair_score: 7.4, photo_url: undefined,      style_type: 'Thư sinh' },
  { username: 'quantran',   overall_score: 7.4, combined_score: 72, rank: 4,  total_users: 1247, psl_tier: 'HTN',        potential_tier: 'HTN',        appeal_score: 7.5, jaw_score: 7.2, eyes_score: 7.7, nose_score: 7.1, hair_score: 7.9, photo_url: undefined,      style_type: 'Techwear' },
  { username: 'minh_dep',   overall_score: 6.8, combined_score: 63, rank: 5,  total_users: 1247, psl_tier: 'MTN',        potential_tier: 'HTN',        appeal_score: 6.9, jaw_score: 6.6, eyes_score: 7.0, nose_score: 6.8, hair_score: 7.2, photo_url: undefined,      style_type: 'Sporty'   },
];

export type { LeaderboardEntry };

export interface SubmitScoreParams {
  overall_score:  number;
  username:       string;
  is_public:      boolean;
  psl_tier?:      string;
  potential_tier?: string;
  appeal_score?:  number;
  jaw_score?:     number;
  eyes_score?:    number;
  nose_score?:    number;
  hair_score?:    number;
  photo_uri?:     string;
  style_type?:    string;
}

// ── Avatar upload ─────────────────────────────────────────────────────────────

/**
 * Resize ảnh xuống 240×240 (giữ nguyên logic cũ) → POST multipart lên /api/v1/avatars
 * Backend (S3Service.java) sẽ resize lại + upload S3 → trả public URL
 * Trả undefined nếu upload fail (score vẫn submit được, chỉ không có ảnh)
 */
async function uploadAvatarPhoto(photoUri: string): Promise<string | undefined> {
  try {
    const resized = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ resize: { width: 240, height: 240 } }],
      { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
    );

    // FormData multipart — React Native cần object với { uri, name, type }
    const formData = new FormData();
    formData.append('file', {
      uri:  resized.uri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    const { data } = await api.post<{ url: string }>('/api/v1/avatars', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.url;
  } catch {
    return undefined; // Upload fail — submit score mà không có avatar
  }
}

// ── useLeaderboard hook ───────────────────────────────────────────────────────

export function useLeaderboard() {

  // ── submitScore ─────────────────────────────────────────────────────────────
  const submitScore = async (
    params: SubmitScoreParams,
  ): Promise<{ rank: number; total_users: number } | null> => {
    try {
      // 1. Upload avatar nếu public + có ảnh
      let photo_url: string | undefined;
      if (params.is_public && params.photo_uri) {
        photo_url = await uploadAvatarPhoto(params.photo_uri);
      }

      // 2. Tính combined_score client-side (giống logic cũ)
      // Backend cũng tính lại để đảm bảo — client-side chỉ để optimistic display
      const tierIndex    = PSL_TIER_ORDER.indexOf((params.psl_tier ?? '') as any);
      const combined_score = params.overall_score * 7 + Math.max(0, tierIndex) * 5;

      // 3. POST /api/v1/scores
      // Backend rate limit: 30 lần / giờ / user
      const { data } = await api.post('/api/v1/scores', {
        overall_score:  params.overall_score,
        username:       params.username,
        is_public:      params.is_public,
        psl_tier:       params.psl_tier,
        potential_tier: params.potential_tier,
        appeal_score:   params.appeal_score,
        jaw_score:      params.jaw_score,
        eyes_score:     params.eyes_score,
        nose_score:     params.nose_score,
        hair_score:     params.hair_score,
        photo_url,
        combined_score,
        style_type:     params.style_type,
      });

      // Backend trả { rank, total_users } — snake_case nhờ Jackson config
      return { rank: data.rank, total_users: data.total_users };
    } catch {
      return null;
    }
  };

  // ── fetchLeaderboard ────────────────────────────────────────────────────────
  const fetchLeaderboard = async (limit = 100): Promise<LeaderboardEntry[]> => {
    try {
      // GET /api/v1/leaderboard?page=0&size=100
      // Backend trả Spring Page: { content: [...], total_elements, ... }
      const { data } = await api.get('/api/v1/leaderboard', {
        params: { page: 0, size: limit },
      });

      const result = (data.content ?? []) as LeaderboardEntry[];
      return result.length > 0 ? result : MOCK_LEADERBOARD;
    } catch {
      return MOCK_LEADERBOARD;
    }
  };

  // ── searchLeaderboard ───────────────────────────────────────────────────────
  const searchLeaderboard = async (query: string): Promise<LeaderboardEntry[]> => {
    try {
      if (!query.trim()) return fetchLeaderboard();

      // GET /api/v1/leaderboard/search?q=...&size=50
      const { data } = await api.get('/api/v1/leaderboard/search', {
        params: { q: query.trim(), size: 50 },
      });

      const result = (data.content ?? []) as LeaderboardEntry[];
      if (result.length === 0) {
        // Fallback: filter mock data locally
        return MOCK_LEADERBOARD.filter(u =>
          u.username.toLowerCase().includes(query.trim().toLowerCase()),
        );
      }
      return result;
    } catch {
      return MOCK_LEADERBOARD.filter(u =>
        u.username.toLowerCase().includes(query.trim().toLowerCase()),
      );
    }
  };

  return { submitScore, fetchLeaderboard, searchLeaderboard };
}
