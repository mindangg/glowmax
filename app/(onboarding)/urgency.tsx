import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Rect, Circle, Line } from 'react-native-svg';
import ChromaticGlassBackground from '../../components/backgrounds/ChromaticGlassBackground';
import MixedText from '../../components/ui/MixedText';
import FrostedButton from '../../components/ui/FrostedButton';
import { COLORS, FONTS } from '../../lib/constants';
import GrainBackground from "../../components/backgrounds/GrainBackground";

const { width: SW } = Dimensions.get('window');

export default function UrgencyScreen() {
  const router = useRouter();

  const clockOpacity = useSharedValue(0);
  const clockTranslateY = useSharedValue(-20);
  const text1Opacity = useSharedValue(0);
  const text2Opacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    clockOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    clockTranslateY.value = withDelay(200, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
    text1Opacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    text2Opacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(1400, withTiming(1, { duration: 500 }));
  }, []);

  const clockStyle = useAnimatedStyle(() => ({
    opacity: clockOpacity.value,
    transform: [{ translateY: clockTranslateY.value }],
  }));
  const text1Style = useAnimatedStyle(() => ({ opacity: text1Opacity.value }));
  const text2Style = useAnimatedStyle(() => ({ opacity: text2Opacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <GrainBackground>
      <View style={styles.container}>

        {/* First text block */}
        <Animated.View style={[styles.textBlock, text1Style]}>
          <MixedText
            segments={[
              { text: 'NHƯNG ', size: 18 },
              { text: 'CƠ HỘI NÀY\n', bold: true, size: 28 },
              { text: 'SẼ KHÔNG KÉO DÀI MÃI.', bold: true, size: 28 },
            ]}
          />
        </Animated.View>

        {/* Clock icon SVG */}
        <Animated.View style={[styles.clockWrapper, clockStyle]}>
          <Svg width={100} height={140} viewBox="0 0 100 140">
            {/* Clock body */}
            <Rect x="15" y="20" width="70" height="100" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            {/* Clock face */}
            <Circle cx="50" cy="65" r="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            {/* Hour hand */}
            <Line x1="50" y1="65" x2="50" y2="45" stroke={COLORS.ACCENT_GOLD} strokeWidth="2" strokeLinecap="round" />
            {/* Minute hand */}
            <Line x1="50" y1="65" x2="63" y2="58" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Center dot */}
            <Circle cx="50" cy="65" r="3" fill={COLORS.ACCENT_GOLD} />
            {/* Pendulum */}
            <Line x1="50" y1="95" x2="50" y2="115" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <Circle cx="50" cy="118" r="5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          </Svg>
        </Animated.View>

        <Animated.View style={[styles.textBlock, text2Style]}>
          <MixedText
              segments={[
                { text: 'BẠN VẪN CÒN SỚM,\n', bold: true, size: 30, color: COLORS.TEXT_PRIMARY },
                { text: 'NHƯNG CUỘC CHƠI\n', size: 16 },
                { text: 'SẼ SỚM THAY ĐỔI HOÀN TOÀN.', bold: true, size: 16 },
              ]}
          />
        </Animated.View>

        <Animated.View style={[styles.textBlock, text2Style]}>
          <MixedText
            segments={[
              { text: 'BẠN VẪN CÒN SỚM,\n', bold: true, size: 30, color: COLORS.TEXT_PRIMARY },
              { text: 'NHƯNG CUỘC CHƠI\n', size: 16 },
              { text: 'SẼ SỚM THAY ĐỔI HOÀN TOÀN.', bold: true, size: 16 },
            ]}
          />
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="BẮT ĐẦU NGAY"
            onPress={() => router.push('/(onboarding)/reviews')}
          />
        </Animated.View>
      </View>
    </GrainBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  clockWrapper: {
    marginBottom: 50,
  },
  textBlock: {
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
