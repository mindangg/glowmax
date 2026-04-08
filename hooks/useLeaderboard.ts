import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';
import { PSL_TIER_ORDER } from '../lib/constants';
import { LeaderboardEntry } from '../types';

// ── Mock leaderboard (fallback khi DB trống) ──────────────────────────────────
// combined_score = overall_score × 7 + tier_index × 5  (max 100)
const TEST_USER_URI = Image.resolveAssetSource(require('../assets/test_user.png')).uri;

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { username: 'TrueChang_VN',   overall_score: 8.8, combined_score: 91.6, psl_tier: 'True Chang', potential_tier: 'True Chang', appeal_score: 9.0, jaw_score: 8.5, eyes_score: 8.8, nose_score: 8.9, hair_score: 9.2, photo_url: TEST_USER_URI, rank: 1,  total_users: 10 },
  { username: 'ChangBro',        overall_score: 8.0, combined_score: 81.0, psl_tier: 'Chang',      potential_tier: 'True Chang', appeal_score: 8.2, jaw_score: 7.8, eyes_score: 8.0, nose_score: 7.9, hair_score: 8.1, photo_url: TEST_USER_URI, rank: 2,  total_users: 10 },
  { username: 'HTN_King',        overall_score: 7.5, combined_score: 72.5, psl_tier: 'HTN',        potential_tier: 'Chang',      appeal_score: 7.8, jaw_score: 7.2, eyes_score: 7.5, nose_score: 7.3, hair_score: 7.6, photo_url: TEST_USER_URI, rank: 3,  total_users: 10 },
  { username: 'NguyenMaxx',      overall_score: 7.2, combined_score: 70.4, psl_tier: 'HTN',        potential_tier: 'Chang',      appeal_score: 7.4, jaw_score: 7.0, eyes_score: 7.2, nose_score: 7.1, hair_score: 6.9, photo_url: TEST_USER_URI, rank: 4,  total_users: 10 },
  { username: 'MTN_Grind',       overall_score: 6.8, combined_score: 62.6, psl_tier: 'MTN',        potential_tier: 'HTN',        appeal_score: 7.0, jaw_score: 6.5, eyes_score: 6.8, nose_score: 6.7, hair_score: 6.4, photo_url: TEST_USER_URI, rank: 5,  total_users: 10 },
  { username: 'LooksMaxViet',    overall_score: 6.4, combined_score: 59.8, psl_tier: 'MTN',        potential_tier: 'HTN',        appeal_score: 6.6, jaw_score: 6.2, eyes_score: 6.4, nose_score: 6.3, hair_score: 6.0, photo_url: TEST_USER_URI, rank: 6,  total_users: 10 },
  { username: 'LTN_Rising',      overall_score: 6.0, combined_score: 52.0, psl_tier: 'LTN',        potential_tier: 'MTN',        appeal_score: 6.2, jaw_score: 5.8, eyes_score: 6.0, nose_score: 5.9, hair_score: 5.7, photo_url: TEST_USER_URI, rank: 7,  total_users: 10 },
  { username: 'Sub5_Climber',    overall_score: 5.2, combined_score: 41.4, psl_tier: 'Sub 5',      potential_tier: 'LTN',        appeal_score: 5.5, jaw_score: 5.0, eyes_score: 5.2, nose_score: 5.1, hair_score: 4.8, photo_url: TEST_USER_URI, rank: 8,  total_users: 10 },
  { username: 'TrungLM99',       overall_score: 4.8, combined_score: 38.6, psl_tier: 'Sub 5',      potential_tier: 'LTN',        appeal_score: 5.0, jaw_score: 4.6, eyes_score: 4.8, nose_score: 4.7, hair_score: 4.4, photo_url: TEST_USER_URI, rank: 9,  total_users: 10 },
  { username: 'NewbieMaxx',      overall_score: 3.5, combined_score: 24.5, psl_tier: 'Sub 3',      potential_tier: 'Sub 5',      appeal_score: 3.8, jaw_score: 3.2, eyes_score: 3.5, nose_score: 3.4, hair_score: 3.1, photo_url: TEST_USER_URI, rank: 10, total_users: 10 },
];

export type { LeaderboardEntry };

export interface SubmitScoreParams {
  overall_score: number;
  username: string;
  is_public: boolean;
  psl_tier?: string;
  potential_tier?: string;
  appeal_score?: number;
  jaw_score?: number;
  eyes_score?: number;
  nose_score?: number;
  hair_score?: number;
  photo_uri?: string;
}

async function uploadAvatarPhoto(photoUri: string, userId: string): Promise<string | undefined> {
  try {
    const resized = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ resize: { width: 240, height: 240 } }],
      { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
    );

    const response = await fetch(resized.uri);
    const blob = await response.blob();

    const filePath = `${userId}.jpg`;
    const { error } = await supabase.storage
      .from('leaderboard-avatars')
      .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });

    if (error) return undefined;

    const { data: { publicUrl } } = supabase.storage
      .from('leaderboard-avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch {
    return undefined;
  }
}

const LEADERBOARD_SELECT =
  'username, overall_score, combined_score, rank, total_users, psl_tier, potential_tier, appeal_score, jaw_score, eyes_score, nose_score, hair_score, photo_url';

export function useLeaderboard() {
  const submitScore = async (
    params: SubmitScoreParams,
  ): Promise<{ rank: number; total_users: number } | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return null;

      // Upload photo thumbnail if submitting publicly
      let photo_url: string | undefined;
      if (params.is_public && params.photo_uri) {
        photo_url = await uploadAvatarPhoto(params.photo_uri, userId);
      }

      // Client-side combined_score (edge function also calculates it as authoritative)
      const tierIndex = PSL_TIER_ORDER.indexOf((params.psl_tier ?? '') as any);
      const combined_score = params.overall_score * 7 + Math.max(0, tierIndex) * 5;

      const { data, error: fnError } = await supabase.functions.invoke('submit-score', {
        body: {
          overall_score:   params.overall_score,
          username:        params.username,
          is_public:       params.is_public,
          psl_tier:        params.psl_tier,
          potential_tier:  params.potential_tier,
          appeal_score:    params.appeal_score,
          jaw_score:       params.jaw_score,
          eyes_score:      params.eyes_score,
          nose_score:      params.nose_score,
          hair_score:      params.hair_score,
          photo_url,
          combined_score,
        },
      });
      if (fnError) return null;
      return data as { rank: number; total_users: number };
    } catch {
      return null;
    }
  };

  const fetchLeaderboard = async (limit = 100): Promise<LeaderboardEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(LEADERBOARD_SELECT)
        .order('rank', { ascending: true })
        .limit(limit);
      if (error) return MOCK_LEADERBOARD;
      const result = (data ?? []) as LeaderboardEntry[];
      return result.length > 0 ? result : MOCK_LEADERBOARD;
    } catch {
      return MOCK_LEADERBOARD;
    }
  };

  const searchLeaderboard = async (query: string): Promise<LeaderboardEntry[]> => {
    try {
      if (!query.trim()) return fetchLeaderboard();
      const { data, error } = await supabase
        .from('leaderboard')
        .select(LEADERBOARD_SELECT)
        .ilike('username', `%${query.trim()}%`)
        .order('rank', { ascending: true })
        .limit(50);
      if (error) {
        // fallback: filter mock data locally
        return MOCK_LEADERBOARD.filter(u =>
          u.username.toLowerCase().includes(query.trim().toLowerCase())
        );
      }
      const result = (data ?? []) as LeaderboardEntry[];
      // If DB is empty, search mock data
      if (result.length === 0) {
        return MOCK_LEADERBOARD.filter(u =>
          u.username.toLowerCase().includes(query.trim().toLowerCase())
        );
      }
      return result;
    } catch {
      return MOCK_LEADERBOARD.filter(u =>
        u.username.toLowerCase().includes(query.trim().toLowerCase())
      );
    }
  };

  return { submitScore, fetchLeaderboard, searchLeaderboard };
}
