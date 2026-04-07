import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Svg, { Ellipse, Circle, Rect, Line } from 'react-native-svg';
import { ScanMetric } from '../../types';
import { COLORS, FONTS } from '../../lib/constants';

interface MetricCardProps {
  currentMetric: ScanMetric;
  metricIndex: number;
}

// Simplified bust icon with highlight on the active facial area
function BustIcon({ highlightArea }: { highlightArea: ScanMetric['bustHighlightArea'] }) {
  const gold = COLORS.ACCENT_GOLD;
  const base = 'rgba(255,255,255,0.3)';

  const hl = (area: string) =>
    highlightArea === area || highlightArea === 'full' ? gold : base;

  return (
    <Svg width={56} height={56} viewBox="0 0 48 48">
      {/* Head outline */}
      <Ellipse cx={24} cy={18} rx={11} ry={14} fill="none" stroke={base} strokeWidth={1.2} />
      {/* Neck + shoulders */}
      <Line x1={20} y1={31} x2={20} y2={36} stroke={base} strokeWidth={1.2} />
      <Line x1={28} y1={31} x2={28} y2={36} stroke={base} strokeWidth={1.2} />
      <Line x1={8} y1={44} x2={20} y2={36} stroke={base} strokeWidth={1.2} />
      <Line x1={40} y1={44} x2={28} y2={36} stroke={base} strokeWidth={1.2} />
      {/* Eyes */}
      <Circle cx={19} cy={16} r={2} fill={hl('eyes')} />
      <Circle cx={29} cy={16} r={2} fill={hl('eyes')} />
      {/* Nose */}
      <Line x1={24} y1={16} x2={24} y2={22} stroke={hl('nose')} strokeWidth={1.2} />
      {/* Mouth */}
      <Line x1={20} y1={25} x2={28} y2={25} stroke={hl('mouth')} strokeWidth={1.2} />
      {/* Jaw highlight */}
      {(highlightArea === 'jaw' || highlightArea === 'full') && (
        <Ellipse cx={24} cy={26} rx={10} ry={6} fill="none" stroke={gold} strokeWidth={1} opacity={0.7} />
      )}
      {/* Forehead highlight */}
      {(highlightArea === 'forehead' || highlightArea === 'full') && (
        <Rect x={14} y={5} width={20} height={8} rx={4} fill="none" stroke={gold} strokeWidth={1} opacity={0.7} />
      )}
      {/* Cheeks highlight */}
      {(highlightArea === 'cheeks' || highlightArea === 'full') && (
        <>
          <Circle cx={14} cy={20} r={4} fill="none" stroke={gold} strokeWidth={1} opacity={0.7} />
          <Circle cx={34} cy={20} r={4} fill="none" stroke={gold} strokeWidth={1} opacity={0.7} />
        </>
      )}
      {/* Chin highlight */}
      {(highlightArea === 'chin' || highlightArea === 'full') && (
        <Circle cx={24} cy={30} r={4} fill="none" stroke={gold} strokeWidth={1} opacity={0.7} />
      )}
      {/* Gold crosshair at nose bridge — always visible */}
      <Line x1={20} y1={19} x2={28} y2={19} stroke={gold} strokeWidth={1.4} />
      <Line x1={24} y1={15} x2={24} y2={23} stroke={gold} strokeWidth={1.4} />
    </Svg>
  );
}

// Animated CALCULATING... text
function CalculatingText() {
  const dotOpacity = useSharedValue(0);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.15, { duration: 500 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Text
        style={{
          fontFamily: FONTS.MONO,
          fontSize: 12,
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: 2.5,
        }}
      >
        CALCULATING
      </Text>
      <Animated.Text
        style={[
          {
            fontFamily: FONTS.MONO,
            fontSize: 12,
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: 2.5,
          },
          animatedStyle,
        ]}
      >
        ...
      </Animated.Text>
    </View>
  );
}

export default function MetricCard({ currentMetric, metricIndex }: MetricCardProps) {
  return (
    <Animated.View
      key={`metric-${metricIndex}`}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(120)}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(8,10,12,0.92)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        paddingBottom: 48,
        paddingHorizontal: 28,
        alignItems: 'center',
        gap: 0,
      }}
    >
      {/* Bust icon */}
      <BustIcon highlightArea={currentMetric.bustHighlightArea} />

      {/* Metric name */}
      <Text
        style={{
          fontFamily: FONTS.MONO_BOLD,
          fontSize: 32,
          color: COLORS.TEXT_PRIMARY,
          textTransform: 'uppercase',
          letterSpacing: 4,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        {currentMetric.name}
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontFamily: FONTS.MONO,
          fontSize: 11,
          color: 'rgba(255,255,255,0.38)',
          letterSpacing: 2.5,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        {currentMetric.subtitle}
      </Text>

      {/* CALCULATING... */}
      <View style={{ marginTop: 18 }}>
        <CalculatingText />
      </View>
    </Animated.View>
  );
}
