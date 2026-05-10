import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getApiErrorMessage } from '../lib/apiClient';
import { TrialResult, FullAnalysisResult, OnboardingAnswers } from '../types';

const ONBOARDING_KEY = 'glowmax_onboarding';

interface ScanStore {
  // ── Trial scan ────────────────────────────────────────────────
  trialResult: TrialResult | null;
  trialState: 'unused' | 'used';
  trialLoading: boolean;
  trialError: string | null;
  triggerTrialScan: (photo: string) => Promise<TrialResult | null>;

  // ── Full analysis ─────────────────────────────────────────────
  fullResults: FullAnalysisResult | null;
  fullLoading: boolean;
  fullError: string | null;
  triggerAnalysis: (photo: string) => Promise<FullAnalysisResult | null>;

  // ── Photos ────────────────────────────────────────────────────
  frontPhoto: string | null;
  sidePhoto: string | null;
  setFrontPhoto: (uri: string | null) => void;
  setSidePhoto: (uri: string | null) => void;

  // ── Reset (logout / new session) ──────────────────────────────
  reset: () => void;
}

export const useScanStore = create<ScanStore>()((set) => ({
  trialResult: null,
  trialState: 'unused',
  trialLoading: false,
  trialError: null,

  fullResults: null,
  fullLoading: false,
  fullError: null,

  frontPhoto: null,
  sidePhoto: null,

  triggerTrialScan: async (photo) => {
    set({ trialLoading: true, trialError: null });
    try {
      const { data } = await api.post<TrialResult>('/api/v1/analyze/trial', { photo });
      if (!data) throw new Error('Empty response');
      set({ trialResult: data, trialState: 'used', trialLoading: false });
      return data;
    } catch (err) {
      set({
        trialError: getApiErrorMessage(err, 'Scan thất bại. Vui lòng thử lại.'),
        trialLoading: false,
      });
      return null;
    }
  },

  triggerAnalysis: async (photo) => {
    set({ fullLoading: true, fullError: null });
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      const onboarding: Partial<OnboardingAnswers> = stored ? JSON.parse(stored) : {};
      const { data } = await api.post<FullAnalysisResult>('/api/v1/analyze/full', {
        photo,
        gender: onboarding.gender ?? 'male',
        age: onboarding.age ?? 20,
      });
      if (!data) throw new Error('Empty response');
      set({ fullResults: data, fullLoading: false });
      return data;
    } catch (err) {
      set({
        fullError: getApiErrorMessage(err, 'Phân tích thất bại. Vui lòng thử lại.'),
        fullLoading: false,
      });
      return null;
    }
  },

  setFrontPhoto: (uri) => set({ frontPhoto: uri }),
  setSidePhoto: (uri) => set({ sidePhoto: uri }),

  reset: () =>
    set({
      trialResult: null,
      trialState: 'unused',
      trialLoading: false,
      trialError: null,
      fullResults: null,
      fullLoading: false,
      fullError: null,
      frontPhoto: null,
      sidePhoto: null,
    }),
}));
