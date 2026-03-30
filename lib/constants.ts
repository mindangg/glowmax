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
} as const;

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
  zygos: 'ZYGOS / CHEEKS',
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
