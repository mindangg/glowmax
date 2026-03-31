import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Line, Circle, Rect } from 'react-native-svg';
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { ScanMetric } from '../../types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Stroke styling
const SW = 1.8;
const DOT_R = 4;
const WHITE = '#FFFFFF';

// Animated SVG components
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// ---------------------------------------------------------------------------
// Face landmark positions — fallback when no face detection available
// ---------------------------------------------------------------------------
const DEFAULT_F = {
  cx: SCREEN_W * 0.5,
  leX: SCREEN_W * 0.36,
  reX: SCREEN_W * 0.64,
  eyeY: SCREEN_H * 0.38,
  noseBridgeY: SCREEN_H * 0.44,
  noseTipY: SCREEN_H * 0.52,
  noseLeftX: SCREEN_W * 0.44,
  noseRightX: SCREEN_W * 0.56,
  mouthY: SCREEN_H * 0.60,
  mouthLeftX: SCREEN_W * 0.40,
  mouthRightX: SCREEN_W * 0.60,
  jawY: SCREEN_H * 0.68,
  leftJawX: SCREEN_W * 0.28,
  rightJawX: SCREEN_W * 0.72,
  chinY: SCREEN_H * 0.78,
  foreheadY: SCREEN_H * 0.24,
  zygoLeftX: SCREEN_W * 0.22,
  zygoRightX: SCREEN_W * 0.78,
  zygoY: SCREEN_H * 0.46,
  neckLeftX: SCREEN_W * 0.34,
  neckRightX: SCREEN_W * 0.66,
  neckY: SCREEN_H * 0.72,
};

// ---------------------------------------------------------------------------
// Animated overlay line — fades in when scanLineY passes its Y coordinate
// ---------------------------------------------------------------------------
function AnimatedOverlayLine({
  x1, y1, x2, y2, scanLineY, stroke = WHITE, strokeWidth = SW,
}: {
  x1: number; y1: number; x2: number; y2: number;
  scanLineY: SharedValue<number>; stroke?: string; strokeWidth?: number;
}) {
  const opacity = useSharedValue(0);
  const lineY = Math.min(y1, y2);

  useAnimatedReaction(
    () => scanLineY.value,
    (currentY) => {
      if (currentY >= lineY && opacity.value === 0) {
        opacity.value = withTiming(1, { duration: 300 });
      }
    },
    [lineY]
  );

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedLine
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={stroke} strokeWidth={strokeWidth}
      animatedProps={animatedProps}
    />
  );
}

function AnimatedOverlayDot({
  cx, cy, r = DOT_R, scanLineY, fill = WHITE,
}: {
  cx: number; cy: number; r?: number;
  scanLineY: SharedValue<number>; fill?: string;
}) {
  const opacity = useSharedValue(0);

  useAnimatedReaction(
    () => scanLineY.value,
    (currentY) => {
      if (currentY >= cy && opacity.value === 0) {
        opacity.value = withTiming(1, { duration: 300 });
      }
    },
    [cy]
  );

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedCircle
      cx={cx} cy={cy} r={r} fill={fill}
      animatedProps={animatedProps}
    />
  );
}

function AnimatedOverlayRect({
  x, y, width, height, rx = 2, scanLineY,
}: {
  x: number; y: number; width: number; height: number; rx?: number;
  scanLineY: SharedValue<number>;
}) {
  const opacity = useSharedValue(0);

  useAnimatedReaction(
    () => scanLineY.value,
    (currentY) => {
      if (currentY >= y && opacity.value === 0) {
        opacity.value = withTiming(1, { duration: 300 });
      }
    },
    [y]
  );

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedRect
      x={x} y={y} width={width} height={height} rx={rx}
      fill="none" stroke={WHITE} strokeWidth={SW}
      animatedProps={animatedProps}
    />
  );
}

// ---------------------------------------------------------------------------
// Render each metric's AR overlay using real or fallback coordinates
// ---------------------------------------------------------------------------
function renderOverlay(
  metric: ScanMetric,
  F: typeof DEFAULT_F,
  scanLineY: SharedValue<number>,
) {
  switch (metric.name) {
    case 'ESR':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX} y1={F.eyeY} x2={F.reX} y2={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leX} cy={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.reX} cy={F.eyeY} scanLineY={scanLineY} />
        </>
      );

    case 'IPD':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX} y1={F.eyeY} x2={F.reX} y2={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leX} cy={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.reX} cy={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.cx} y1={F.eyeY} x2={F.cx} y2={F.noseBridgeY + 10} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseBridgeY + 10} r={3} scanLineY={scanLineY} />
        </>
      );

    case 'NOSE':
      return (
        <>
          <AnimatedOverlayLine x1={F.cx - 30} y1={F.eyeY + 5} x2={F.cx + 30} y2={F.eyeY + 5} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.cx} y1={F.eyeY + 5} x2={F.cx} y2={F.noseTipY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseTipY} r={3} scanLineY={scanLineY} />
        </>
      );

    case 'FWHR':
      return (
        <>
          <AnimatedOverlayRect
            x={F.leftJawX - 5}
            y={F.foreheadY + 10}
            width={F.rightJawX + 5 - (F.leftJawX - 5)}
            height={F.mouthY - F.foreheadY - 10}
            scanLineY={scanLineY}
          />
          <AnimatedOverlayLine
            x1={F.cx - 8} y1={F.noseBridgeY} x2={F.cx + 8} y2={F.noseBridgeY}
            scanLineY={scanLineY} stroke="#F5C842" strokeWidth={1.5}
          />
          <AnimatedOverlayLine
            x1={F.cx} y1={F.noseBridgeY - 8} x2={F.cx} y2={F.noseBridgeY + 8}
            scanLineY={scanLineY} stroke="#F5C842" strokeWidth={1.5}
          />
        </>
      );

    case 'EYE TYPE':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX - 24} y1={F.eyeY} x2={F.leX + 24} y2={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.leX - 24} y1={F.eyeY - 5} x2={F.leX - 24} y2={F.eyeY + 5} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.leX + 24} y1={F.eyeY - 5} x2={F.leX + 24} y2={F.eyeY + 5} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.reX - 24} y1={F.eyeY} x2={F.reX + 24} y2={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.reX - 24} y1={F.eyeY - 5} x2={F.reX - 24} y2={F.eyeY + 5} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.reX + 24} y1={F.eyeY - 5} x2={F.reX + 24} y2={F.eyeY + 5} scanLineY={scanLineY} />
        </>
      );

    case 'MOUTH':
      return (
        <>
          <AnimatedOverlayLine x1={F.mouthLeftX - 5} y1={F.mouthY} x2={F.mouthRightX + 5} y2={F.mouthY} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.cx} y1={F.mouthY - 20} x2={F.cx} y2={F.mouthY + 20} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.mouthY} r={3} scanLineY={scanLineY} />
        </>
      );

    case 'ZYGOS':
      return (
        <>
          <AnimatedOverlayDot cx={F.zygoLeftX + 10} cy={F.zygoY} r={DOT_R + 1} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.zygoRightX - 10} cy={F.zygoY} r={DOT_R + 1} scanLineY={scanLineY} />
        </>
      );

    case 'GONIAL':
      return (
        <>
          <AnimatedOverlayLine x1={F.leftJawX} y1={F.jawY - 5} x2={F.cx} y2={F.chinY} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.rightJawX} y1={F.jawY - 5} x2={F.cx} y2={F.chinY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leftJawX} cy={F.jawY - 5} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.rightJawX} cy={F.jawY - 5} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY} scanLineY={scanLineY} />
        </>
      );

    case 'BIGONIAL WIDTH':
      return (
        <>
          <AnimatedOverlayLine x1={F.zygoLeftX + 5} y1={F.zygoY} x2={F.zygoRightX - 5} y2={F.zygoY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.zygoLeftX + 5} cy={F.zygoY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.zygoRightX - 5} cy={F.zygoY} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.leftJawX + 5} y1={F.jawY} x2={F.rightJawX - 5} y2={F.jawY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leftJawX + 5} cy={F.jawY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.rightJawX - 5} cy={F.jawY} scanLineY={scanLineY} />
        </>
      );

    case 'MWNWR':
      return (
        <>
          <AnimatedOverlayLine x1={F.noseLeftX - 4} y1={F.noseTipY} x2={F.noseRightX + 4} y2={F.noseTipY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.noseLeftX - 4} cy={F.noseTipY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.noseRightX + 4} cy={F.noseTipY} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.mouthLeftX} y1={F.mouthY} x2={F.mouthRightX} y2={F.mouthY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.mouthLeftX} cy={F.mouthY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.mouthRightX} cy={F.mouthY} scanLineY={scanLineY} />
        </>
      );

    case 'NECK-JAW WIDTH':
      return (
        <>
          <AnimatedOverlayLine x1={F.leftJawX} y1={F.jawY - 4} x2={F.rightJawX} y2={F.jawY - 4} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leftJawX} cy={F.jawY - 4} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.rightJawX} cy={F.jawY - 4} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.neckLeftX} y1={F.neckY} x2={F.neckRightX} y2={F.neckY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.neckLeftX} cy={F.neckY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.neckRightX} cy={F.neckY} scanLineY={scanLineY} />
        </>
      );

    case 'MIDFACE RATIO':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX} y1={F.eyeY} x2={F.reX} y2={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leX} cy={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.reX} cy={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.cx} y1={F.eyeY} x2={F.cx} y2={F.noseTipY + 8} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseTipY + 8} r={3} scanLineY={scanLineY} />
        </>
      );

    case 'LOWER THIRD PROPORTIONS':
      return (
        <>
          <AnimatedOverlayLine x1={F.cx} y1={F.noseTipY + 4} x2={F.cx} y2={F.chinY + 5} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseTipY + 4} r={3} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY + 5} r={3} scanLineY={scanLineY} />
        </>
      );

    case 'JFA':
      return (
        <>
          <AnimatedOverlayLine x1={F.leftJawX + 5} y1={F.jawY} x2={F.cx} y2={F.chinY + 5} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.rightJawX - 5} y1={F.jawY} x2={F.cx} y2={F.chinY + 5} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.leftJawX + 5} y1={F.jawY} x2={F.rightJawX - 5} y2={F.jawY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leftJawX + 5} cy={F.jawY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.rightJawX - 5} cy={F.jawY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY + 5} scanLineY={scanLineY} />
        </>
      );

    case 'JZW':
      return (
        <>
          <AnimatedOverlayLine x1={F.zygoLeftX + 5} y1={F.zygoY - 2} x2={F.zygoRightX - 5} y2={F.zygoY - 2} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.zygoLeftX + 5} cy={F.zygoY - 2} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.zygoRightX - 5} cy={F.zygoY - 2} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.leftJawX + 5} y1={F.jawY - 2} x2={F.rightJawX - 5} y2={F.jawY - 2} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leftJawX + 5} cy={F.jawY - 2} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.rightJawX - 5} cy={F.jawY - 2} scanLineY={scanLineY} />
        </>
      );

    case 'CFR':
      return (
        <>
          <AnimatedOverlayLine x1={F.cx} y1={F.noseTipY + 6} x2={F.cx} y2={F.chinY + 5} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.cx - 24} y1={F.mouthY} x2={F.cx + 24} y2={F.mouthY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseTipY + 6} r={3} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY + 5} r={3} scanLineY={scanLineY} />
        </>
      );

    case 'CMR':
      return (
        <>
          <AnimatedOverlayLine x1={F.cx} y1={F.eyeY - 10} x2={F.cx} y2={F.chinY + 5} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.eyeY - 10} r={3} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY + 5} r={3} scanLineY={scanLineY} />
        </>
      );

    case 'CANTHAL TILT':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX - 20} y1={F.eyeY + 4} x2={F.leX + 20} y2={F.eyeY - 5} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leX - 20} cy={F.eyeY + 4} r={3} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leX + 20} cy={F.eyeY - 5} r={3} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.reX - 20} y1={F.eyeY - 5} x2={F.reX + 20} y2={F.eyeY + 4} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.reX - 20} cy={F.eyeY - 5} r={3} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.reX + 20} cy={F.eyeY + 4} r={3} scanLineY={scanLineY} />
        </>
      );

    case 'ESPR':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX - 5} y1={F.eyeY} x2={F.reX + 5} y2={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leX - 5} cy={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.reX + 5} cy={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.eyeY} r={3} scanLineY={scanLineY} />
        </>
      );

    case 'EAR':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX - 22} y1={F.eyeY} x2={F.leX + 22} y2={F.eyeY} scanLineY={scanLineY} />
          <AnimatedOverlayLine x1={F.leX} y1={F.eyeY - 18} x2={F.leX} y2={F.eyeY + 18} scanLineY={scanLineY} />
          <AnimatedOverlayDot cx={F.leX} cy={F.eyeY} r={3} scanLineY={scanLineY} />
        </>
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// ScanOverlay component
// ---------------------------------------------------------------------------
interface ScanOverlayProps {
  currentMetric: ScanMetric;
  scanLineY: SharedValue<number>;
}

export default function ScanOverlay({ currentMetric, scanLineY }: ScanOverlayProps) {
  const F = DEFAULT_F;

  return (
    <Svg
      width={SCREEN_W}
      height={SCREEN_H}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {renderOverlay(currentMetric, F, scanLineY)}
    </Svg>
  );
}
