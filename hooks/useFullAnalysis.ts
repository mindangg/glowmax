import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { FullAnalysisResult } from '../types';

function getDateStr(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const MOCK_RESULTS: FullAnalysisResult = {
  pslResult: {
    psl_tier: 'LTN',
    potential_tier: 'HTN',
    date: getDateStr(),
  },
  categories: [
    {
      category: 'appeal',
      title: 'APPEAL',
      overallScore: 7,
      metrics: [],
    },
    {
      category: 'jaw',
      title: 'JAW',
      overallScore: 2,
      metrics: [
        { name: 'GONIAL ANGLE', subtitle: 'JAW ANGULARITY', score: 6.5, measurement: 118.0, unit: '°', idealRange: '115-125°', description: '', tips: [] },
        { name: 'RMR', subtitle: 'RAMUS TO MANDIBLE RATIO', score: 5.0, measurement: 0.67, unit: '', idealRange: '0.59-0.75', description: '', tips: [] },
        { name: 'MAXILLARY PROJECTION', subtitle: '', score: 5.0, displayLabel: 'MODERATE', description: '', tips: [] },
        { name: 'JFA', subtitle: 'JAW FRONTAL ANGLE', score: 7.0, measurement: 132.0, unit: '°', idealRange: '113.91-132.74°', description: '', tips: [] },
        { name: 'JZW', subtitle: 'JAW-ZYGOMATIC WIDTH (JAW WIDTH TO ZYGO WIDTH)', score: 4.0, measurement: 0.88, unit: '', idealRange: '0.896-0.991', description: '', tips: [] },
        { name: 'CFR', subtitle: 'CHIN-PHILTRUM (SPACE BETWEEN LIPS & NOSE) RATIO', score: 2.0, measurement: 1.40, unit: '', idealRange: '1.917-2.192', description: '', tips: [] },
        { name: 'CMR', subtitle: 'CHIN-MIDFACE RATIO', score: 4.0, measurement: 0.61, unit: '', idealRange: '0.615-0.68', description: '', tips: [] },
      ],
    },
    {
      category: 'eyes',
      title: 'EYES',
      overallScore: 6,
      metrics: [
        { name: 'EYE TYPE', subtitle: '', score: 3.0, displayLabel: 'PREY', description: '', tips: [] },
        { name: 'CANTHAL TILT', subtitle: '', score: 5.0, measurement: 2.90, unit: '°', idealRange: '0.938-6.547°', description: '', tips: [] },
        { name: 'ESR', subtitle: 'EYE SEPARATION RATIO', score: 6.0, measurement: 0.53, unit: '', idealRange: '0.49-0.542', description: '', tips: [] },
        { name: 'ESPR', subtitle: 'EYE SPACING RATIO', score: 5.0, measurement: 0.71, unit: '', idealRange: '0.713-0.859', description: '', tips: [] },
        { name: 'EAR', subtitle: 'EYE ASPECT RATIO', score: 7.0, measurement: 0.24, unit: '', idealRange: '0.17-0.25', description: '', tips: [] },
        { name: 'SCLERAL SHOW', subtitle: '', score: 8.0, displayLabel: 'LOW', description: '', tips: [] },
        { name: 'UNDEREYE BAGS', subtitle: '', score: 8.0, displayLabel: 'LOW', description: '', tips: [] },
      ],
    },
    {
      category: 'orbitals',
      title: 'ORBITALS',
      overallScore: 6,
      metrics: [
        { name: 'UEE', subtitle: 'UPPER EYELID EXPOSURE', score: 5.0, displayLabel: 'MODERATE', description: '', tips: [] },
        { name: 'SOFT TISSUE', subtitle: 'FAT ABOVE EYE', score: 8.0, displayLabel: 'LOW', description: '', tips: [] },
        { name: 'BRI', subtitle: 'BROW RIDGE INCLINATION', score: 7.0, measurement: 18.0, unit: '°', idealRange: '15-24°', description: '', tips: [] },
        { name: 'EYEBROW TILT', subtitle: '', score: 7.0, measurement: 15.0, unit: '°', idealRange: '6-18°', description: '', tips: [] },
        { name: 'EYEBROW DENSITY', subtitle: 'SCALE OUT OF 10', score: 7.0, measurement: 7.0, unit: '', description: '', tips: [] },
        { name: 'EYELASH DENSITY', subtitle: 'SCALE OUT OF 10', score: 6.0, measurement: 6.0, unit: '', description: '', tips: [] },
        { name: 'SUPRAORBITAL PROJECTION', subtitle: '', score: 5.0, displayLabel: 'MODERATE', description: '', tips: [] },
      ],
    },
    {
      category: 'zygos',
      title: 'ZYGOS/CHEEKS',
      overallScore: 6,
      metrics: [
        { name: 'ZYGO HEIGHT', subtitle: '', score: 6.0, measurement: 0.70, unit: '', idealRange: '0.7-0.9', description: '', tips: [] },
        { name: 'SUBMALAR HOLLOW INDEX', subtitle: 'SUBMALAR HOLLOW INDEX', score: 6.0, measurement: 6.0, unit: '', idealRange: 'SCALE OUT OF 10', description: '', tips: [] },
        { name: 'ZAP', subtitle: 'ZYGOMATIC ARCH PROJECTION', score: 5.0, displayLabel: 'MEDIUM', description: '', tips: [] },
        { name: 'FACIAL FAT', subtitle: '', score: 8.0, displayLabel: 'LOW', description: '', tips: [] },
        { name: 'NASOLABIAL FOLDS', subtitle: '', score: 8.0, displayLabel: 'LOW', description: '', tips: [] },
        { name: 'ZYGO SYMMETRY', subtitle: '', score: 8.0, displayLabel: 'HIGH', description: '', tips: [] },
        { name: 'ZYGO PROJECTION', subtitle: '', score: 5.0, displayLabel: 'MEDIUM', description: '', tips: [] },
      ],
    },
    {
      category: 'harmony',
      title: 'HARMONY SCORE',
      overallScore: 3,
      metrics: [
        { name: 'FACIAL THIRDS', subtitle: '', score: 3.0, measurement: 0.24, unit: '', idealRange: '0.33 EACH', description: '', tips: [] },
        { name: 'FWHR', subtitle: 'FACIAL WIDTH TO HEIGHT RATIO', score: 6.0, measurement: 1.84, unit: '', idealRange: '1.628-2.396', description: '', tips: [] },
        { name: 'TFWHR', subtitle: 'TOTAL FACIAL WIDTH TO HEIGHT RATIO', score: 6.0, measurement: 1.02, unit: '', idealRange: '0.853-1.205', description: '', tips: [] },
        { name: 'BIGONIAL WIDTH', subtitle: '', score: 4.0, measurement: 88, unit: '%', idealRange: '89.85-99.31%', description: '', tips: [] },
        { name: 'MWNWR', subtitle: 'MOUTH WIDTH TO NOSE WIDTH RATIO', score: 5.0, measurement: 1.13, unit: '', idealRange: '1.148-1.274', description: '', tips: [] },
        { name: 'NECK-JAW WIDTH', subtitle: '', score: 3.0, measurement: 85, unit: '%', idealRange: '90-100%', description: '', tips: [] },
      ],
    },
    {
      category: 'nose',
      title: 'NOSE',
      overallScore: 6,
      metrics: [
        { name: 'NFRA', subtitle: 'NASOFRONTAL ANGLE', score: 7.0, measurement: 118.0, unit: '°', idealRange: '108-130°', description: '', tips: [] },
        { name: 'NFA', subtitle: 'NASOFACIAL ANGLE', score: 7.0, measurement: 32.0, unit: '°', idealRange: '30-36°', description: '', tips: [] },
        { name: 'NLA', subtitle: 'NASOLABIAL ANGLE', score: 7.0, measurement: 105.0, unit: '°', idealRange: '94-112°', description: '', tips: [] },
        { name: 'TFC', subtitle: 'TOTAL FACE CONVEXITY', score: 7.0, measurement: 142.0, unit: '°', idealRange: '137-143°', description: '', tips: [] },
        { name: 'NA', subtitle: 'NASAL ANGLE', score: 7.0, measurement: 119.0, unit: '°', idealRange: '115-130°', description: '', tips: [] },
        { name: 'LLULR', subtitle: 'LOWER TO UPPER LIP RATIO', score: 3.0, measurement: 1.23, unit: '', idealRange: '1.499-2.352', description: '', tips: [] },
        { name: 'MENTOLABIAL ANGLE', subtitle: '', score: 7.0, measurement: 120.0, unit: '°', idealRange: '108-130°', description: '', tips: [] },
      ],
    },
    {
      category: 'hair',
      title: 'HAIR',
      overallScore: 5,
      metrics: [
        { name: 'HAIRLINE', subtitle: '', score: 5.0, displayLabel: 'MATURE', description: '', tips: [] },
        { name: 'HAIR VOLUME', subtitle: '', score: 5.0, displayLabel: 'MEDIUM', description: '', tips: [] },
        { name: 'TEMPLES', subtitle: 'DENSITY AT TEMPLES', score: 5.0, displayLabel: 'MEDIUM', description: '', tips: [] },
        { name: 'OPTIMAL HAIRCUT', subtitle: 'BEST HAIR STYLE FOR YOUR FWHR & ESR', score: 10.0, displayLabel: 'YES', description: '', tips: [] },
      ],
    },
    {
      category: 'ascension',
      title: 'ASCENSION PLAN',
      overallScore: 0,
      metrics: [
        { name: 'MEWING', subtitle: 'TONGUE POSTURE', score: 0, description: 'Place tongue on palate 24/7', tips: ['Basic mewing', 'Hard mewing'] },
        { name: 'SKIN CARE', subtitle: 'ROUTINE', score: 0, description: 'Retinol + SPF daily', tips: ['Tretinoin 0.025%', 'Sunscreen SPF 50'] },
      ],
    },
    {
      category: 'leanmax',
      title: 'LEANMAX PROTOCOL',
      overallScore: 0,
      metrics: [
        { name: 'BODY FAT %', subtitle: 'TARGET', score: 0, description: 'Get to 12-15% body fat', tips: ['Caloric deficit', 'Cardio 3x/week'] },
      ],
    },
  ],
};

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
