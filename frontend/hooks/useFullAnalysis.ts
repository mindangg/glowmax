import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getApiErrorMessage } from '../lib/apiClient';
import { FullAnalysisResult, OnboardingAnswers } from '../types';

const ONBOARDING_KEY = 'glowmax_onboarding';

export function useFullAnalysis() {
  const [results, setResults]     = useState<FullAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const triggerAnalysis = useCallback(async (photoBase64: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Đọc onboarding answers (gender, age) từ AsyncStorage — set khi onboarding
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      const onboarding: Partial<OnboardingAnswers> = stored ? JSON.parse(stored) : {};

      // POST /api/v1/analyze/full
      // Backend: rate limit 10 lần / giờ / user (trả 429 nếu vượt)
      const { data } = await api.post<FullAnalysisResult>('/api/v1/analyze/full', {
        photo:  photoBase64,
        gender: onboarding.gender ?? 'male',
        age:    onboarding.age    ?? 20,
      });

      if (!data) throw new Error('Analysis failed — empty response');

      setResults(data);
      return data;
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Phân tích thất bại. Vui lòng thử lại.');
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { triggerAnalysis, results, isLoading, error };
}
