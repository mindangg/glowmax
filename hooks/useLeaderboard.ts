import { supabase } from '../lib/supabase';

export interface LeaderboardEntry {
  username: string;
  overall_score: number;
  rank: number;
  total_users: number;
}

export function useLeaderboard() {
  const submitScore = async (
    score: number,
    username: string,
    isPublic: boolean
  ): Promise<{ rank: number; total_users: number } | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return null;

      const { data, error } = await supabase.functions.invoke('submit-score', {
        body: { overall_score: score, username, is_public: isPublic },
      });
      if (error) return null;
      return data as { rank: number; total_users: number };
    } catch {
      return null;
    }
  };

  const fetchLeaderboard = async (limit = 50): Promise<LeaderboardEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('username, overall_score, rank, total_users')
        .order('rank', { ascending: true })
        .limit(limit);
      if (error) return [];
      return (data ?? []) as LeaderboardEntry[];
    } catch {
      return [];
    }
  };

  return { submitScore, fetchLeaderboard };
}
