import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Line, Circle, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { ScanMetric } from '../../types';
import { FaceCoords } from '../../lib/faceCoords';

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
// Animated overlay line — fades in when scanLineY passes its Y coordinate
// ---------------------------------------------------------------------------
function AnimatedOverlayLine({
  x1, y1, x2, y2, stroke = WHITE, strokeWidth = SW,
}: {
  x1: number; y1: number; x2: number; y2: number;
  stroke?: string; strokeWidth?: number;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

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
  cx, cy, r = DOT_R, fill = WHITE,
}: {
  cx: number; cy: number; r?: number; fill?: string;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

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
  x, y, width, height, rx = 2,
}: {
  x: number; y: number; width: number; height: number; rx?: number;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

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
// Render each metric's AR overlay using real face coordinates
// ---------------------------------------------------------------------------
function renderOverlay(metric: ScanMetric, F: FaceCoords) {
  switch (metric.name) {
    case 'ESR':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX} y1={F.eyeY} x2={F.reX} y2={F.eyeY} />
          <AnimatedOverlayDot cx={F.leX} cy={F.eyeY} />
          <AnimatedOverlayDot cx={F.reX} cy={F.eyeY} />
        </>
      );

    case 'IPD':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX} y1={F.eyeY} x2={F.reX} y2={F.eyeY} />
          <AnimatedOverlayDot cx={F.leX} cy={F.eyeY} />
          <AnimatedOverlayDot cx={F.reX} cy={F.eyeY} />
          <AnimatedOverlayLine x1={F.cx} y1={F.eyeY} x2={F.cx} y2={F.noseBridgeY + 10} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseBridgeY + 10} r={3} />
        </>
      );

    case 'NOSE':
      return (
        <>
          <AnimatedOverlayLine x1={F.cx - 30} y1={F.eyeY + 5} x2={F.cx + 30} y2={F.eyeY + 5} />
          <AnimatedOverlayLine x1={F.cx} y1={F.eyeY + 5} x2={F.cx} y2={F.noseTipY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseTipY} r={3} />
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
          />
          <AnimatedOverlayLine x1={F.cx - 8} y1={F.noseBridgeY} x2={F.cx + 8} y2={F.noseBridgeY} stroke="#F5C842" strokeWidth={1.5} />
          <AnimatedOverlayLine x1={F.cx} y1={F.noseBridgeY - 8} x2={F.cx} y2={F.noseBridgeY + 8} stroke="#F5C842" strokeWidth={1.5} />
        </>
      );

    case 'EYE TYPE':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX - 24} y1={F.eyeY} x2={F.leX + 24} y2={F.eyeY} />
          <AnimatedOverlayLine x1={F.leX - 24} y1={F.eyeY - 5} x2={F.leX - 24} y2={F.eyeY + 5} />
          <AnimatedOverlayLine x1={F.leX + 24} y1={F.eyeY - 5} x2={F.leX + 24} y2={F.eyeY + 5} />
          <AnimatedOverlayLine x1={F.reX - 24} y1={F.eyeY} x2={F.reX + 24} y2={F.eyeY} />
          <AnimatedOverlayLine x1={F.reX - 24} y1={F.eyeY - 5} x2={F.reX - 24} y2={F.eyeY + 5} />
          <AnimatedOverlayLine x1={F.reX + 24} y1={F.eyeY - 5} x2={F.reX + 24} y2={F.eyeY + 5} />
        </>
      );

    case 'MOUTH':
      return (
        <>
          <AnimatedOverlayLine x1={F.mouthLeftX - 5} y1={F.mouthY} x2={F.mouthRightX + 5} y2={F.mouthY} />
          <AnimatedOverlayLine x1={F.cx} y1={F.mouthY - 20} x2={F.cx} y2={F.mouthY + 20} />
          <AnimatedOverlayDot cx={F.cx} cy={F.mouthY} r={3} />
        </>
      );

    case 'ZYGOS':
      return (
        <>
          <AnimatedOverlayDot cx={F.zygoLeftX + 10} cy={F.zygoY} r={DOT_R + 1} />
          <AnimatedOverlayDot cx={F.zygoRightX - 10} cy={F.zygoY} r={DOT_R + 1} />
        </>
      );

    case 'GONIAL':
      return (
        <>
          <AnimatedOverlayLine x1={F.leftJawX} y1={F.jawY - 5} x2={F.cx} y2={F.chinY} />
          <AnimatedOverlayLine x1={F.rightJawX} y1={F.jawY - 5} x2={F.cx} y2={F.chinY} />
          <AnimatedOverlayDot cx={F.leftJawX} cy={F.jawY - 5} />
          <AnimatedOverlayDot cx={F.rightJawX} cy={F.jawY - 5} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY} />
        </>
      );

    case 'BIGONIAL WIDTH':
      return (
        <>
          <AnimatedOverlayLine x1={F.zygoLeftX + 5} y1={F.zygoY} x2={F.zygoRightX - 5} y2={F.zygoY} />
          <AnimatedOverlayDot cx={F.zygoLeftX + 5} cy={F.zygoY} />
          <AnimatedOverlayDot cx={F.zygoRightX - 5} cy={F.zygoY} />
          <AnimatedOverlayLine x1={F.leftJawX + 5} y1={F.jawY} x2={F.rightJawX - 5} y2={F.jawY} />
          <AnimatedOverlayDot cx={F.leftJawX + 5} cy={F.jawY} />
          <AnimatedOverlayDot cx={F.rightJawX - 5} cy={F.jawY} />
        </>
      );

    case 'MWNWR':
      return (
        <>
          <AnimatedOverlayLine x1={F.noseLeftX - 4} y1={F.noseTipY} x2={F.noseRightX + 4} y2={F.noseTipY} />
          <AnimatedOverlayDot cx={F.noseLeftX - 4} cy={F.noseTipY} />
          <AnimatedOverlayDot cx={F.noseRightX + 4} cy={F.noseTipY} />
          <AnimatedOverlayLine x1={F.mouthLeftX} y1={F.mouthY} x2={F.mouthRightX} y2={F.mouthY} />
          <AnimatedOverlayDot cx={F.mouthLeftX} cy={F.mouthY} />
          <AnimatedOverlayDot cx={F.mouthRightX} cy={F.mouthY} />
        </>
      );

    case 'NECK-JAW WIDTH':
      return (
        <>
          <AnimatedOverlayLine x1={F.leftJawX} y1={F.jawY - 4} x2={F.rightJawX} y2={F.jawY - 4} />
          <AnimatedOverlayDot cx={F.leftJawX} cy={F.jawY - 4} />
          <AnimatedOverlayDot cx={F.rightJawX} cy={F.jawY - 4} />
          <AnimatedOverlayLine x1={F.neckLeftX} y1={F.neckY} x2={F.neckRightX} y2={F.neckY} />
          <AnimatedOverlayDot cx={F.neckLeftX} cy={F.neckY} />
          <AnimatedOverlayDot cx={F.neckRightX} cy={F.neckY} />
        </>
      );

    case 'MIDFACE RATIO':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX} y1={F.eyeY} x2={F.reX} y2={F.eyeY} />
          <AnimatedOverlayDot cx={F.leX} cy={F.eyeY} />
          <AnimatedOverlayDot cx={F.reX} cy={F.eyeY} />
          <AnimatedOverlayLine x1={F.cx} y1={F.eyeY} x2={F.cx} y2={F.noseTipY + 8} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseTipY + 8} r={3} />
        </>
      );

    case 'LOWER THIRD PROPORTIONS':
      return (
        <>
          <AnimatedOverlayLine x1={F.cx} y1={F.noseTipY + 4} x2={F.cx} y2={F.chinY + 5} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseTipY + 4} r={3} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY + 5} r={3} />
        </>
      );

    case 'JFA':
      return (
        <>
          <AnimatedOverlayLine x1={F.leftJawX + 5} y1={F.jawY} x2={F.cx} y2={F.chinY + 5} />
          <AnimatedOverlayLine x1={F.rightJawX - 5} y1={F.jawY} x2={F.cx} y2={F.chinY + 5} />
          <AnimatedOverlayLine x1={F.leftJawX + 5} y1={F.jawY} x2={F.rightJawX - 5} y2={F.jawY} />
          <AnimatedOverlayDot cx={F.leftJawX + 5} cy={F.jawY} />
          <AnimatedOverlayDot cx={F.rightJawX - 5} cy={F.jawY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY + 5} />
        </>
      );

    case 'JZW':
      return (
        <>
          <AnimatedOverlayLine x1={F.zygoLeftX + 5} y1={F.zygoY - 2} x2={F.zygoRightX - 5} y2={F.zygoY - 2} />
          <AnimatedOverlayDot cx={F.zygoLeftX + 5} cy={F.zygoY - 2} />
          <AnimatedOverlayDot cx={F.zygoRightX - 5} cy={F.zygoY - 2} />
          <AnimatedOverlayLine x1={F.leftJawX + 5} y1={F.jawY - 2} x2={F.rightJawX - 5} y2={F.jawY - 2} />
          <AnimatedOverlayDot cx={F.leftJawX + 5} cy={F.jawY - 2} />
          <AnimatedOverlayDot cx={F.rightJawX - 5} cy={F.jawY - 2} />
        </>
      );

    case 'CFR':
      return (
        <>
          <AnimatedOverlayLine x1={F.cx} y1={F.noseTipY + 6} x2={F.cx} y2={F.chinY + 5} />
          <AnimatedOverlayLine x1={F.cx - 24} y1={F.mouthY} x2={F.cx + 24} y2={F.mouthY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.noseTipY + 6} r={3} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY + 5} r={3} />
        </>
      );

    case 'CMR':
      return (
        <>
          <AnimatedOverlayLine x1={F.cx} y1={F.eyeY - 10} x2={F.cx} y2={F.chinY + 5} />
          <AnimatedOverlayDot cx={F.cx} cy={F.eyeY - 10} r={3} />
          <AnimatedOverlayDot cx={F.cx} cy={F.chinY + 5} r={3} />
        </>
      );

    case 'CANTHAL TILT':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX - 20} y1={F.eyeY + 4} x2={F.leX + 20} y2={F.eyeY - 5} />
          <AnimatedOverlayDot cx={F.leX - 20} cy={F.eyeY + 4} r={3} />
          <AnimatedOverlayDot cx={F.leX + 20} cy={F.eyeY - 5} r={3} />
          <AnimatedOverlayLine x1={F.reX - 20} y1={F.eyeY - 5} x2={F.reX + 20} y2={F.eyeY + 4} />
          <AnimatedOverlayDot cx={F.reX - 20} cy={F.eyeY - 5} r={3} />
          <AnimatedOverlayDot cx={F.reX + 20} cy={F.eyeY + 4} r={3} />
        </>
      );

    case 'ESPR':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX - 5} y1={F.eyeY} x2={F.reX + 5} y2={F.eyeY} />
          <AnimatedOverlayDot cx={F.leX - 5} cy={F.eyeY} />
          <AnimatedOverlayDot cx={F.reX + 5} cy={F.eyeY} />
          <AnimatedOverlayDot cx={F.cx} cy={F.eyeY} r={3} />
        </>
      );

    case 'EAR':
      return (
        <>
          <AnimatedOverlayLine x1={F.leX - 22} y1={F.eyeY} x2={F.leX + 22} y2={F.eyeY} />
          <AnimatedOverlayLine x1={F.leX} y1={F.eyeY - 18} x2={F.leX} y2={F.eyeY + 18} />
          <AnimatedOverlayDot cx={F.leX} cy={F.eyeY} r={3} />
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
  faceCoords: FaceCoords;
}

export default function ScanOverlay({ currentMetric, faceCoords }: ScanOverlayProps) {
  const F = faceCoords;

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(150)}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Svg width={SCREEN_W} height={SCREEN_H}>
        {renderOverlay(currentMetric, F)}
      </Svg>
    </Animated.View>
  );
}
