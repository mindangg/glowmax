import { PSLTier } from '../types';

export const COLORS = {
  BACKGROUND_PRIMARY: '#0A0C0E',
  BACKGROUND_SECONDARY: '#1A1E22',
  BACKGROUND_ELEVATED: 'rgba(26,30,34,0.95)',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: 'rgba(255,255,255,0.55)',
  ACCENT_GOLD: '#E8C56F',
  SCAN_GOLD_LINE: '#F5C842',
  SCAN_WHITE_LINES: '#FFFFFF',
  GLASS_FILL: 'rgba(255,255,255,0.06)',
  GLASS_FILL_SELECTED: 'rgba(255,255,255,0.95)',
  GRAIN_BG_BASE: '#1A1A1A',
  GRAIN_BG_END: '#222222',
  BUTTON_GRADIENT_START: '#E8C56F',
  BUTTON_GRADIENT_END: '#C9963A',
  MUTED_GRAY: '#999999',

  // Score bar colors (dynamic by score)
  SCORE_BAR_LOW: '#E05555',
  SCORE_BAR_MID: '#D4845A',
  SCORE_BAR_HIGH: '#E8C56F',
} as const;

export const PSL_TIER_COLORS: Record<PSLTier, string> = {
  'Sub 3': '#C0392B',
  'Sub 5': '#E05555',
  'LTN': '#D4845A',
  'MTN': '#E0A060',
  'HTN': '#D4C46A',
  'Chang': '#E8C56F',
  'True Chang': '#F5E6C0',
};

export const PSL_TIER_ORDER: PSLTier[] = [
  'Sub 3', 'Sub 5', 'LTN', 'MTN', 'HTN', 'Chang', 'True Chang',
];

export function getBarColor(score: number): string {
  if (score >= 7) return COLORS.SCORE_BAR_HIGH;
  if (score >= 4) return COLORS.SCORE_BAR_MID;
  return COLORS.SCORE_BAR_LOW;
}

export function getTierColor(tier: PSLTier): string {
  return PSL_TIER_COLORS[tier];
}

export function getTierProgress(tier: PSLTier): number {
  const index = PSL_TIER_ORDER.indexOf(tier);
  return (index + 1) / 7;
}

export const FONTS = {
  MONO: 'SpaceMono-Regular',
  MONO_BOLD: 'SpaceMono-Bold',
} as const;

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const RESULT_CATEGORY_TITLES: Record<string, string> = {
  appeal: 'APPEAL',
  jaw: 'JAW',
  eyes: 'EYES',
  orbitals: 'ORBITALS',
  zygos: 'ZYGOS/CHEEKS',
  harmony: 'HARMONY SCORE',
  nose: 'NOSE',
  hair: 'HAIR',
  ascension: 'ASCENSION PLAN',
  leanmax: 'LEANMAX PROTOCOL',
};

export const RESULT_CATEGORIES = [
  'appeal', 'jaw', 'eyes', 'orbitals', 'zygos',
  'harmony', 'nose', 'hair', 'ascension', 'leanmax',
] as const;
