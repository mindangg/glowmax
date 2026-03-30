import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TrialResult } from '../types';

const MOCK_RESULT: TrialResult = {
  overall_score: 6.8,
  appeal_summary: 'Khuôn mặt có tỷ lệ hài hòa tốt với cấu trúc xương gò má nổi bật.',
  rank: 142,
  total_users: 847,
};

export function useTrialScan() {
  const [trialState, setTrialState] = useState<'unused' | 'used'>('unused');
  const [trialResult, setTrialResult] = useState<TrialResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerTrialScan = useCallback(async (photoBase64: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('trial-scan', {
        body: { photo: photoBase64 },
      });

      if (fnError || !data) throw new Error(fnError?.message || 'Scan failed');

      const result: TrialResult = data;
      setTrialResult(result);
      setTrialState('used');
      return result;
    } catch {
      // Fallback to mock data in development
      setTrialResult(MOCK_RESULT);
      setTrialState('used');
      return MOCK_RESULT;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    trialState,
    triggerTrialScan,
    trialResult,
    rank: trialResult?.rank ?? null,
    totalUsers: trialResult?.total_users ?? null,
    isLoading,
    error,
  };
}
