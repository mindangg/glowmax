import { useState, useCallback } from 'react';
import { api, getApiErrorMessage } from '../lib/apiClient';
import { TrialResult } from '../types';

// Mock fallback khi backend chưa chạy hoặc trial-scan fail
const MOCK_RESULT: TrialResult = {
  overall_score: 6.8,
  appeal_summary: 'Khuôn mặt có tỷ lệ hài hòa tốt với cấu trúc xương gò má nổi bật.',
  rank: 142,
  total_users: 847,
};

export function useTrialScan() {
  const [trialState, setTrialState]   = useState<'unused' | 'used'>('unused');
  const [trialResult, setTrialResult] = useState<TrialResult | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const triggerTrialScan = useCallback(async (photoBase64: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // POST /api/v1/analyze/trial
      // Public endpoint: rate limit 3 lần / ngày / IP (không cần auth, nhưng có JWT thì tốt hơn)
      const { data } = await api.post<TrialResult>('/api/v1/analyze/trial', {
        photo: photoBase64,
      });

      if (!data) throw new Error('Trial scan failed — empty response');

      setTrialResult(data);
      setTrialState('used');
      return data;
    } catch (err) {
      // Fallback về mock data để dev không bị block khi backend chưa ready
      const msg = getApiErrorMessage(err, 'Scan thất bại. Vui lòng thử lại.');
      setError(msg);

      // Dev fallback: comment out khi production
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
    rank:       trialResult?.rank       ?? null,
    totalUsers: trialResult?.total_users ?? null,
    isLoading,
    error,
  };
}
