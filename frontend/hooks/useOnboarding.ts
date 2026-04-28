import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingAnswers } from '../types';

const STORAGE_KEY = 'glowmax_onboarding';

const DEFAULT_ANSWERS: OnboardingAnswers = {
  gender: null,
  age: null,
  heightCm: null,
  weightKg: null,
  goal: null,
  experience: null,
  commitment: null,
  barriers: [],
  improvements: [],
  hardmaxxing: null,
  motivation: [],
  username: null,
};

export function useOnboarding() {
  const [answers, setAnswers] = useState<OnboardingAnswers>(DEFAULT_ANSWERS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try { setAnswers(JSON.parse(stored)); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const setAnswer = useCallback(<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isComplete = !!(
    answers.gender &&
    answers.age &&
    answers.heightCm &&
    answers.weightKg
  );

  const reset = useCallback(() => {
    setAnswers(DEFAULT_ANSWERS);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { answers, setAnswer, isComplete, reset, loaded };
}
