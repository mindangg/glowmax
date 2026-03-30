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
    <Svg width={44} height={44} viewBox="0 0 48 48">
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
    </Svg>
  );
}

// Animated CALCULATING... text with cycling dots
function CalculatingText() {
  const dotOpacity = useSharedValue(0);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.2, { duration: 400 }),
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
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: 2,
        }}
      >
        CALCULATING
      </Text>
      <Animated.Text
        style={[
          {
            fontFamily: FONTS.MONO,
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 2,
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
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(150)}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(10,12,14,0.88)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 44,
        paddingHorizontal: 24,
        alignItems: 'center',
      }}
    >
      {/* Bust icon */}
      <BustIcon highlightArea={currentMetric.bustHighlightArea} />

      {/* Metric name */}
      <Text
        style={{
          fontFamily: FONTS.MONO_BOLD,
          fontSize: 28,
          color: COLORS.TEXT_PRIMARY,
          textTransform: 'uppercase',
          letterSpacing: 3,
          marginTop: 10,
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
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 2,
          marginTop: 6,
          textAlign: 'center',
        }}
      >
        {currentMetric.subtitle}
      </Text>

      {/* CALCULATING... */}
      <View style={{ marginTop: 16 }}>
        <CalculatingText />
      </View>
    </Animated.View>
  );
}
