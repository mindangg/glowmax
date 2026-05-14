import type { FaceCoords } from '../lib/faceCoords';

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
  username: string | null;
}

export interface ScanMetric {
  id: number;
  name: string;
  subtitle: string;
  goldLineYPercent: number;
  faceYKey: keyof Pick<FaceCoords, 'eyeY' | 'noseBridgeY' | 'noseTipY' | 'mouthY' | 'jawY' | 'chinY' | 'foreheadY' | 'zygoY' | 'neckY'>;
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
  psl_tier: string;
  teaser: string;
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
  style_type?: string;
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
  | 'skin';

export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export interface UserScore {
  user_id: string;
  overall_score: number;
  rank: number;
  total_users: number;
  created_at: string;
}

export interface LeaderboardEntry {
  username: string;
  overall_score: number;
  combined_score: number;
  rank: number;
  total_users: number;
  psl_tier?: string;
  potential_tier?: string;
  appeal_score?: number;
  jaw_score?: number;
  eyes_score?: number;
  nose_score?: number;
  hair_score?: number;
  photo_url?: string;
  style_type?: string;
}
