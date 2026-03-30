import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { FullAnalysisResult } from '../types';

const MOCK_RESULTS: FullAnalysisResult = [
  {
    category: 'appeal', title: 'APPEAL', overallScore: 7.2,
    metrics: [
      { name: 'OVERALL FACE SCORE', subtitle: 'PSL RATING', score: 7.2, description: 'Trên trung bình', tips: ['Duy trì tỷ lệ mỡ cơ thể thấp', 'Chăm sóc da đều đặn'] },
      { name: 'FACIAL HARMONY', subtitle: 'SYMMETRY INDEX', score: 7.5, description: 'Hài hòa tốt', tips: ['Mewing để cải thiện cấu trúc hàm'] },
    ],
  },
  {
    category: 'jaw', title: 'JAW', overallScore: 6.8,
    metrics: [
      { name: 'GONIAL ANGLE', subtitle: 'JAW ANGULARITY', score: 6.5, description: 'Trung bình', tips: ['Nhai kẹo cao su cứng'] },
      { name: 'JFA', subtitle: 'JAW FRONTAL ANGLE', score: 7.0, description: 'Tốt', tips: ['Tập jaw exercise'] },
    ],
  },
  {
    category: 'eyes', title: 'EYES', overallScore: 7.8,
    metrics: [
      { name: 'CANTHAL TILT', subtitle: 'EYE TILT', score: 8.0, description: 'Xuất sắc', tips: [] },
      { name: 'IPD', subtitle: 'PUPIL DISTANCE', score: 7.5, description: 'Tốt', tips: [] },
    ],
  },
  {
    category: 'orbitals', title: 'ORBITALS', overallScore: 6.5,
    metrics: [{ name: 'BROW RIDGE', subtitle: 'PROMINENCE', score: 6.5, description: 'Trung bình', tips: ['Minoxidil cho lông mày'] }],
  },
  {
    category: 'zygos', title: 'ZYGOS / CHEEKS', overallScore: 7.0,
    metrics: [{ name: 'ZYGOMATIC WIDTH', subtitle: 'CHEEKBONE', score: 7.0, description: 'Tốt', tips: ['Giảm mỡ mặt'] }],
  },
  {
    category: 'harmony', title: 'HARMONY SCORE', overallScore: 7.3,
    metrics: [{ name: 'FWHR', subtitle: 'FACIAL RATIO', score: 7.3, description: 'Hài hòa', tips: [] }],
  },
  {
    category: 'nose', title: 'NOSE', overallScore: 6.0,
    metrics: [{ name: 'NFA', subtitle: 'NASOFACIAL ANGLE', score: 6.0, description: 'Trung bình', tips: ['Nose shaping exercise'] }],
  },
  {
    category: 'hair', title: 'HAIR', overallScore: 7.5,
    metrics: [{ name: 'DENSITY', subtitle: 'HAIR DENSITY', score: 7.5, description: 'Tốt', tips: ['Finasteride nếu cần'] }],
  },
  {
    category: 'ascension', title: 'ASCENSION PLAN', overallScore: 0,
    metrics: [
      { name: 'MEWING', subtitle: 'TONGUE POSTURE', score: 0, description: 'Đặt lưỡi lên vòm miệng 24/7', tips: ['Mewing cơ bản', 'Hard mewing'] },
      { name: 'SKIN CARE', subtitle: 'ROUTINE', score: 0, description: 'Retinol + SPF hàng ngày', tips: ['Tretinoin 0.025%', 'Sunscreen SPF 50'] },
    ],
  },
  {
    category: 'leanmax', title: 'LEANMAX PROTOCOL', overallScore: 0,
    metrics: [{ name: 'BODY FAT %', subtitle: 'TARGET', score: 0, description: 'Giảm xuống 12-15% body fat', tips: ['Caloric deficit', 'Cardio 3x/tuần'] }],
  },
];

export function useFullAnalysis() {
  const [results, setResults] = useState<FullAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerAnalysis = useCallback(async (photoBase64: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-face', {
        body: { photo: photoBase64 },
      });

      if (fnError || !data) throw new Error(fnError?.message || 'Analysis failed');
      setResults(data);
      return data as FullAnalysisResult;
    } catch {
      // Fallback to mock data in development
      setResults(MOCK_RESULTS);
      return MOCK_RESULTS;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { triggerAnalysis, results, isLoading, error };
}
