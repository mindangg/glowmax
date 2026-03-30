import { ScanMetric } from '../types';

/**
 * 20 metrics in the exact sequence shown in the animation reference frames.
 * Order: IMG_0583 → IMG_0602
 */
export const SCAN_METRICS: ScanMetric[] = [
  { id: 1,  name: 'ESR',                   subtitle: 'EYE SEPARATION DISTANCE',    goldLineYPercent: 38, overlayType: 'horizontal',      bustHighlightArea: 'eyes' },
  { id: 2,  name: 'IPD',                   subtitle: 'INTER PUPILARY DISTANCE',    goldLineYPercent: 36, overlayType: 'cross',           bustHighlightArea: 'eyes' },
  { id: 3,  name: 'NOSE',                  subtitle: 'NOSE HEIGHT',                goldLineYPercent: 38, overlayType: 'cross',           bustHighlightArea: 'nose' },
  { id: 4,  name: 'FWHR',                  subtitle: 'FACIAL WIDTH HEIGHT RATIO',  goldLineYPercent: 28, overlayType: 'rectangle',       bustHighlightArea: 'full' },
  { id: 5,  name: 'EYE TYPE',              subtitle: 'PREDATOR PREY',              goldLineYPercent: 38, overlayType: 'horizontal',      bustHighlightArea: 'eyes' },
  { id: 6,  name: 'MOUTH',                 subtitle: 'MOUTH SIZE',                 goldLineYPercent: 55, overlayType: 'cross',           bustHighlightArea: 'mouth' },
  { id: 7,  name: 'ZYGOS',                 subtitle: 'ZYGOMATIC BONE',             goldLineYPercent: 45, overlayType: 'dots',            bustHighlightArea: 'cheeks' },
  { id: 8,  name: 'GONIAL',                subtitle: 'GONIAL ANGULARITY',          goldLineYPercent: 60, overlayType: 'vshape',          bustHighlightArea: 'jaw' },
  { id: 9,  name: 'BIGONIAL WIDTH',        subtitle: 'JAW WIDTH PERCENTAGE',       goldLineYPercent: 35, overlayType: 'dual_horizontal', bustHighlightArea: 'jaw' },
  { id: 10, name: 'MWNWR',                 subtitle: 'MOUTH NOSE WIDTH RATIO',     goldLineYPercent: 38, overlayType: 'dual_horizontal', bustHighlightArea: 'mouth' },
  { id: 11, name: 'NECK-JAW WIDTH',        subtitle: 'NECK TO JAW WIDTH RATIO',    goldLineYPercent: 58, overlayType: 'dual_horizontal', bustHighlightArea: 'jaw' },
  { id: 12, name: 'MIDFACE RATIO',         subtitle: 'IPD TO EYE MOUTH HEIGHT',    goldLineYPercent: 50, overlayType: 'cross',           bustHighlightArea: 'full' },
  { id: 13, name: 'LOWER THIRD PROPORTIONS', subtitle: 'LOWER THIRD PROPORTIONS', goldLineYPercent: 30, overlayType: 'vertical',        bustHighlightArea: 'chin' },
  { id: 14, name: 'JFA',                   subtitle: 'JAW FRONTAL ANGLE',          goldLineYPercent: 45, overlayType: 'vshape',          bustHighlightArea: 'jaw' },
  { id: 15, name: 'JZW',                   subtitle: 'JAW ZYGOMATIC WIDTH',        goldLineYPercent: 35, overlayType: 'dual_horizontal', bustHighlightArea: 'cheeks' },
  { id: 16, name: 'CFR',                   subtitle: 'CHIN PHILTRUM RATIO',        goldLineYPercent: 52, overlayType: 'cross',           bustHighlightArea: 'chin' },
  { id: 17, name: 'CMR',                   subtitle: 'CHIN MIDFACE RATIO',         goldLineYPercent: 38, overlayType: 'vertical',        bustHighlightArea: 'full' },
  { id: 18, name: 'CANTHAL TILT',          subtitle: 'EYE TILT ANGLE',             goldLineYPercent: 38, overlayType: 'angle',           bustHighlightArea: 'eyes' },
  { id: 19, name: 'ESPR',                  subtitle: 'EYE SPACING RATIO',          goldLineYPercent: 42, overlayType: 'horizontal',      bustHighlightArea: 'eyes' },
  { id: 20, name: 'EAR',                   subtitle: 'EYE ASPECT RATIO',           goldLineYPercent: 36, overlayType: 'cross',           bustHighlightArea: 'eyes' },
];

export const RESULT_CATEGORIES_DATA = [
  { category: 'appeal'    as const, title: 'APPEAL',           subMetrics: ['OVERALL FACE SCORE', 'FACIAL HARMONY'] },
  { category: 'jaw'       as const, title: 'JAW',              subMetrics: ['GONIAL ANGLE', 'RMR', 'MAXILLARY PROJECTION', 'JFA', 'JZW', 'CFR', 'CMR'] },
  { category: 'eyes'      as const, title: 'EYES',             subMetrics: ['IPD', 'EYE TYPE', 'CANTHAL TILT', 'ESPR', 'PFL'] },
  { category: 'orbitals'  as const, title: 'ORBITALS',         subMetrics: ['ORBITAL DEPTH', 'BROW RIDGE', 'SUPRAORBITAL'] },
  { category: 'zygos'     as const, title: 'ZYGOS / CHEEKS',   subMetrics: ['ZYGOMATIC WIDTH', 'CHEEK HOLLOWNESS', 'BIGONIAL WIDTH'] },
  { category: 'harmony'   as const, title: 'HARMONY SCORE',    subMetrics: ['FWHR', 'MIDFACE RATIO', 'TOTAL FACIAL CONVEXITY', 'SYMMETRY'] },
  { category: 'nose'      as const, title: 'NOSE',             subMetrics: ['NFRA', 'NFA', 'NLA', 'NOSE ANGLE', 'NASAL TIP'] },
  { category: 'hair'      as const, title: 'HAIR',             subMetrics: ['HAIRLINE', 'DENSITY', 'NORWOOD SCALE'] },
  { category: 'ascension' as const, title: 'ASCENSION PLAN',   subMetrics: ['MEWING', 'SKIN CARE', 'DIET', 'EXERCISE'] },
  { category: 'leanmax'   as const, title: 'LEANMAX PROTOCOL', subMetrics: ['BODY FAT %', 'WATER RETENTION', 'FACIAL LEANNESS'] },
];
