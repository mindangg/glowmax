import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Line, Circle, Rect } from 'react-native-svg';
import { ScanMetric } from '../../types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Stroke styling
const SW = 1.8;
const DOT_R = 4;
const WHITE = '#FFFFFF';

// ---------------------------------------------------------------------------
// Face landmark positions (fractions of screen, calibrated to reference frames)
// ---------------------------------------------------------------------------
const F = {
  // Center X
  cx: SCREEN_W * 0.5,

  // Eye centers (left/right from viewer perspective)
  leX: SCREEN_W * 0.36,
  reX: SCREEN_W * 0.64,
  eyeY: SCREEN_H * 0.38,

  // Nose
  noseBridgeY: SCREEN_H * 0.44,
  noseTipY: SCREEN_H * 0.52,
  noseLeftX: SCREEN_W * 0.44,
  noseRightX: SCREEN_W * 0.56,

  // Mouth
  mouthY: SCREEN_H * 0.60,
  mouthLeftX: SCREEN_W * 0.40,
  mouthRightX: SCREEN_W * 0.60,

  // Jaw
  jawY: SCREEN_H * 0.68,
  leftJawX: SCREEN_W * 0.28,
  rightJawX: SCREEN_W * 0.72,

  // Chin
  chinY: SCREEN_H * 0.78,

  // Forehead
  foreheadY: SCREEN_H * 0.24,

  // Zygomatic (widest cheek points)
  zygoLeftX: SCREEN_W * 0.22,
  zygoRightX: SCREEN_W * 0.78,
  zygoY: SCREEN_H * 0.46,

  // Neck
  neckLeftX: SCREEN_W * 0.34,
  neckRightX: SCREEN_W * 0.66,
  neckY: SCREEN_H * 0.72,
};

interface ScanOverlayProps {
  currentMetric: ScanMetric;
}

// ---------------------------------------------------------------------------
// Each case renders white (#FFF) AR measurement lines matching the reference
// animation frames IMG_0583 → IMG_0602
// ---------------------------------------------------------------------------
function renderOverlay(metric: ScanMetric) {
  switch (metric.name) {
    // -----------------------------------------------------------------------
    // 1. ESR — horizontal line between eyes + filled dots at pupils
    // Ref: IMG_0583
    // -----------------------------------------------------------------------
    case 'ESR':
      return (
        <>
          <Line x1={F.leX} y1={F.eyeY} x2={F.reX} y2={F.eyeY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leX} cy={F.eyeY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.reX} cy={F.eyeY} r={DOT_R} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 2. IPD — horizontal between eyes + vertical down to nose bridge + dot
    // Ref: IMG_0584
    // -----------------------------------------------------------------------
    case 'IPD':
      return (
        <>
          <Line x1={F.leX} y1={F.eyeY} x2={F.reX} y2={F.eyeY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leX} cy={F.eyeY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.reX} cy={F.eyeY} r={DOT_R} fill={WHITE} />
          <Line x1={F.cx} y1={F.eyeY} x2={F.cx} y2={F.noseBridgeY + 10} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.cx} cy={F.noseBridgeY + 10} r={3} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 3. NOSE — horizontal crossbar at brow/bridge + vertical down to tip
    // Ref: IMG_0585  (T-shape: crossbar then line down)
    // -----------------------------------------------------------------------
    case 'NOSE':
      return (
        <>
          <Line x1={F.cx - 30} y1={F.eyeY + 5} x2={F.cx + 30} y2={F.eyeY + 5} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.cx} y1={F.eyeY + 5} x2={F.cx} y2={F.noseTipY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.cx} cy={F.noseTipY} r={3} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 4. FWHR — white rectangle around face + gold crosshair at center
    // Ref: IMG_0586
    // -----------------------------------------------------------------------
    case 'FWHR':
      return (
        <>
          <Rect
            x={F.leftJawX - 5}
            y={F.foreheadY + 10}
            width={F.rightJawX + 5 - (F.leftJawX - 5)}
            height={F.mouthY - F.foreheadY - 10}
            rx={2}
            fill="none"
            stroke={WHITE}
            strokeWidth={SW}
          />
          <Line x1={F.cx - 8} y1={F.noseBridgeY} x2={F.cx + 8} y2={F.noseBridgeY} stroke="#F5C842" strokeWidth={1.5} />
          <Line x1={F.cx} y1={F.noseBridgeY - 8} x2={F.cx} y2={F.noseBridgeY + 8} stroke="#F5C842" strokeWidth={1.5} />
        </>
      );

    // -----------------------------------------------------------------------
    // 5. EYE TYPE — measurement bars at each eye with end-caps
    // Ref: IMG_0587
    // -----------------------------------------------------------------------
    case 'EYE TYPE':
      return (
        <>
          {/* Left eye bar + end caps */}
          <Line x1={F.leX - 24} y1={F.eyeY} x2={F.leX + 24} y2={F.eyeY} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.leX - 24} y1={F.eyeY - 5} x2={F.leX - 24} y2={F.eyeY + 5} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.leX + 24} y1={F.eyeY - 5} x2={F.leX + 24} y2={F.eyeY + 5} stroke={WHITE} strokeWidth={SW} />
          {/* Right eye bar + end caps */}
          <Line x1={F.reX - 24} y1={F.eyeY} x2={F.reX + 24} y2={F.eyeY} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.reX - 24} y1={F.eyeY - 5} x2={F.reX - 24} y2={F.eyeY + 5} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.reX + 24} y1={F.eyeY - 5} x2={F.reX + 24} y2={F.eyeY + 5} stroke={WHITE} strokeWidth={SW} />
        </>
      );

    // -----------------------------------------------------------------------
    // 6. MOUTH — crosshair centered on mouth
    // Ref: IMG_0588
    // -----------------------------------------------------------------------
    case 'MOUTH':
      return (
        <>
          <Line x1={F.mouthLeftX - 5} y1={F.mouthY} x2={F.mouthRightX + 5} y2={F.mouthY} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.cx} y1={F.mouthY - 20} x2={F.cx} y2={F.mouthY + 20} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.cx} cy={F.mouthY} r={3} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 7. ZYGOS — two filled dots at cheekbone positions
    // Ref: IMG_0589
    // -----------------------------------------------------------------------
    case 'ZYGOS':
      return (
        <>
          <Circle cx={F.zygoLeftX + 10} cy={F.zygoY} r={DOT_R + 1} fill={WHITE} />
          <Circle cx={F.zygoRightX - 10} cy={F.zygoY} r={DOT_R + 1} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 8. GONIAL — V-shape from jaw corners to chin + dots at vertices
    // Ref: IMG_0590
    // -----------------------------------------------------------------------
    case 'GONIAL':
      return (
        <>
          <Line x1={F.leftJawX} y1={F.jawY - 5} x2={F.cx} y2={F.chinY} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.rightJawX} y1={F.jawY - 5} x2={F.cx} y2={F.chinY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leftJawX} cy={F.jawY - 5} r={DOT_R} fill={WHITE} />
          <Circle cx={F.rightJawX} cy={F.jawY - 5} r={DOT_R} fill={WHITE} />
          <Circle cx={F.cx} cy={F.chinY} r={DOT_R} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 9. BIGONIAL WIDTH — dual horizontal: zygo width + jaw width
    // Ref: IMG_0591
    // -----------------------------------------------------------------------
    case 'BIGONIAL WIDTH':
      return (
        <>
          {/* Upper line — zygomatic width */}
          <Line x1={F.zygoLeftX + 5} y1={F.zygoY} x2={F.zygoRightX - 5} y2={F.zygoY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.zygoLeftX + 5} cy={F.zygoY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.zygoRightX - 5} cy={F.zygoY} r={DOT_R} fill={WHITE} />
          {/* Lower line — jaw width */}
          <Line x1={F.leftJawX + 5} y1={F.jawY} x2={F.rightJawX - 5} y2={F.jawY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leftJawX + 5} cy={F.jawY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.rightJawX - 5} cy={F.jawY} r={DOT_R} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 10. MWNWR — dual horizontal: nose width + mouth width
    // Ref: IMG_0592
    // -----------------------------------------------------------------------
    case 'MWNWR':
      return (
        <>
          {/* Nose width */}
          <Line x1={F.noseLeftX - 4} y1={F.noseTipY} x2={F.noseRightX + 4} y2={F.noseTipY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.noseLeftX - 4} cy={F.noseTipY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.noseRightX + 4} cy={F.noseTipY} r={DOT_R} fill={WHITE} />
          {/* Mouth width */}
          <Line x1={F.mouthLeftX} y1={F.mouthY} x2={F.mouthRightX} y2={F.mouthY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.mouthLeftX} cy={F.mouthY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.mouthRightX} cy={F.mouthY} r={DOT_R} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 11. NECK-JAW WIDTH — dual horizontal: jaw + neck width
    // Ref: IMG_0593
    // -----------------------------------------------------------------------
    case 'NECK-JAW WIDTH':
      return (
        <>
          {/* Jaw width */}
          <Line x1={F.leftJawX} y1={F.jawY - 4} x2={F.rightJawX} y2={F.jawY - 4} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leftJawX} cy={F.jawY - 4} r={DOT_R} fill={WHITE} />
          <Circle cx={F.rightJawX} cy={F.jawY - 4} r={DOT_R} fill={WHITE} />
          {/* Neck width */}
          <Line x1={F.neckLeftX} y1={F.neckY} x2={F.neckRightX} y2={F.neckY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.neckLeftX} cy={F.neckY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.neckRightX} cy={F.neckY} r={DOT_R} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 12. MIDFACE RATIO — cross: horizontal at eyes + vertical to mouth
    // Ref: IMG_0594
    // -----------------------------------------------------------------------
    case 'MIDFACE RATIO':
      return (
        <>
          <Line x1={F.leX} y1={F.eyeY} x2={F.reX} y2={F.eyeY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leX} cy={F.eyeY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.reX} cy={F.eyeY} r={DOT_R} fill={WHITE} />
          <Line x1={F.cx} y1={F.eyeY} x2={F.cx} y2={F.noseTipY + 8} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.cx} cy={F.noseTipY + 8} r={3} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 13. LOWER THIRD PROPORTIONS — vertical from nose tip to chin
    // Ref: IMG_0595
    // -----------------------------------------------------------------------
    case 'LOWER THIRD PROPORTIONS':
      return (
        <>
          <Line x1={F.cx} y1={F.noseTipY + 4} x2={F.cx} y2={F.chinY + 5} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.cx} cy={F.noseTipY + 4} r={3} fill={WHITE} />
          <Circle cx={F.cx} cy={F.chinY + 5} r={3} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 14. JFA — triangle: jaw corners + chin with dots
    // Ref: IMG_0596
    // -----------------------------------------------------------------------
    case 'JFA':
      return (
        <>
          <Line x1={F.leftJawX + 5} y1={F.jawY} x2={F.cx} y2={F.chinY + 5} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.rightJawX - 5} y1={F.jawY} x2={F.cx} y2={F.chinY + 5} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.leftJawX + 5} y1={F.jawY} x2={F.rightJawX - 5} y2={F.jawY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leftJawX + 5} cy={F.jawY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.rightJawX - 5} cy={F.jawY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.cx} cy={F.chinY + 5} r={DOT_R} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 15. JZW — dual horizontal: zygo width + jaw width
    // Ref: IMG_0597
    // -----------------------------------------------------------------------
    case 'JZW':
      return (
        <>
          {/* Zygomatic width */}
          <Line x1={F.zygoLeftX + 5} y1={F.zygoY - 2} x2={F.zygoRightX - 5} y2={F.zygoY - 2} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.zygoLeftX + 5} cy={F.zygoY - 2} r={DOT_R} fill={WHITE} />
          <Circle cx={F.zygoRightX - 5} cy={F.zygoY - 2} r={DOT_R} fill={WHITE} />
          {/* Jaw width */}
          <Line x1={F.leftJawX + 5} y1={F.jawY - 2} x2={F.rightJawX - 5} y2={F.jawY - 2} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leftJawX + 5} cy={F.jawY - 2} r={DOT_R} fill={WHITE} />
          <Circle cx={F.rightJawX - 5} cy={F.jawY - 2} r={DOT_R} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 16. CFR — vertical philtrum-to-chin + horizontal at mouth
    // Ref: IMG_0598
    // -----------------------------------------------------------------------
    case 'CFR':
      return (
        <>
          <Line x1={F.cx} y1={F.noseTipY + 6} x2={F.cx} y2={F.chinY + 5} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.cx - 24} y1={F.mouthY} x2={F.cx + 24} y2={F.mouthY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.cx} cy={F.noseTipY + 6} r={3} fill={WHITE} />
          <Circle cx={F.cx} cy={F.chinY + 5} r={3} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 17. CMR — long vertical line from between eyes to chin
    // Ref: IMG_0599
    // -----------------------------------------------------------------------
    case 'CMR':
      return (
        <>
          <Line x1={F.cx} y1={F.eyeY - 10} x2={F.cx} y2={F.chinY + 5} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.cx} cy={F.eyeY - 10} r={3} fill={WHITE} />
          <Circle cx={F.cx} cy={F.chinY + 5} r={3} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 18. CANTHAL TILT — angled lines through each eye (slight upward tilt)
    // Ref: IMG_0600
    // -----------------------------------------------------------------------
    case 'CANTHAL TILT':
      return (
        <>
          {/* Left eye — inner corner low, outer corner high */}
          <Line x1={F.leX - 20} y1={F.eyeY + 4} x2={F.leX + 20} y2={F.eyeY - 5} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leX - 20} cy={F.eyeY + 4} r={3} fill={WHITE} />
          <Circle cx={F.leX + 20} cy={F.eyeY - 5} r={3} fill={WHITE} />
          {/* Right eye — mirror: inner corner low, outer corner high */}
          <Line x1={F.reX - 20} y1={F.eyeY - 5} x2={F.reX + 20} y2={F.eyeY + 4} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.reX - 20} cy={F.eyeY - 5} r={3} fill={WHITE} />
          <Circle cx={F.reX + 20} cy={F.eyeY + 4} r={3} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 19. ESPR — horizontal connecting eyes + center reference dot
    // Ref: IMG_0601
    // -----------------------------------------------------------------------
    case 'ESPR':
      return (
        <>
          <Line x1={F.leX - 5} y1={F.eyeY} x2={F.reX + 5} y2={F.eyeY} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leX - 5} cy={F.eyeY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.reX + 5} cy={F.eyeY} r={DOT_R} fill={WHITE} />
          <Circle cx={F.cx} cy={F.eyeY} r={3} fill={WHITE} />
        </>
      );

    // -----------------------------------------------------------------------
    // 20. EAR — crosshair centered on left eye
    // Ref: IMG_0602
    // -----------------------------------------------------------------------
    case 'EAR':
      return (
        <>
          <Line x1={F.leX - 22} y1={F.eyeY} x2={F.leX + 22} y2={F.eyeY} stroke={WHITE} strokeWidth={SW} />
          <Line x1={F.leX} y1={F.eyeY - 18} x2={F.leX} y2={F.eyeY + 18} stroke={WHITE} strokeWidth={SW} />
          <Circle cx={F.leX} cy={F.eyeY} r={3} fill={WHITE} />
        </>
      );

    default:
      return null;
  }
}

export default function ScanOverlay({ currentMetric }: ScanOverlayProps) {
  return (
    <Svg
      width={SCREEN_W}
      height={SCREEN_H}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {renderOverlay(currentMetric)}
    </Svg>
  );
}
