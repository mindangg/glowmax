export interface OnboardingAnswers {
  gender: 'male' | 'female' | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: string | null;
  experience: string | null;
  commitment: string | null;
  barriers: string[];
  improvements: string[];
  hardmaxxing: boolean | null;
  motivation: string[];
}

export interface ScanMetric {
  id: number;
  name: string;
  subtitle: string;
  goldLineYPercent: number;
  overlayType: 'horizontal' | 'vertical' | 'rectangle' | 'vshape' | 'angle' | 'dots' | 'cross' | 'dual_horizontal';
  bustHighlightArea: 'eyes' | 'nose' | 'jaw' | 'mouth' | 'chin' | 'forehead' | 'cheeks' | 'full';
}

export interface MixedTextSegment {
  text: string;
  bold?: boolean;
  size?: number;
  color?: string;
}

export interface TrialResult {
  overall_score: number;
  appeal_summary: string;
  rank: number;
  total_users: number;
}

export interface MetricScore {
  name: string;
  subtitle: string;
  score: number;
  label?: string;
  description: string;
  tips: string[];
  measurement?: number;
  unit?: string;
  idealRange?: string;
  displayLabel?: string;
}

export type PSLTier = 'Sub 3' | 'Sub 5' | 'LTN' | 'MTN' | 'HTN' | 'Chang' | 'True Chang';

export interface PSLResult {
  psl_tier: PSLTier;
  potential_tier: PSLTier;
  date: string;
}

export interface ResultCategoryData {
  category: ResultCategory;
  title: string;
  metrics: MetricScore[];
  overallScore: number;
}

export interface FullAnalysisResult {
  pslResult: PSLResult;
  categories: ResultCategoryData[];
}

export type ResultCategory =
  | 'appeal'
  | 'jaw'
  | 'eyes'
  | 'orbitals'
  | 'zygos'
  | 'harmony'
  | 'nose'
  | 'hair'
  | 'ascension'
  | 'leanmax';

export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export interface UserScore {
  user_id: string;
  overall_score: number;
  rank: number;
  total_users: number;
  created_at: string;
}
