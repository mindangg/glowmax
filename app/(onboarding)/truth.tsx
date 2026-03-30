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
import Svg, { Ellipse, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import GrainBackground from '../../components/backgrounds/GrainBackground';
import MixedText from '../../components/ui/MixedText';
import MorseCodeDivider from '../../components/ui/MorseCodeDivider';
import FrostedButton from '../../components/ui/FrostedButton';
import { COLORS, FONTS } from '../../lib/constants';

const { width: SW } = Dimensions.get('window');

export default function TruthScreen() {
  const router = useRouter();

  const pillOpacity = useSharedValue(0);
  const pillTranslateY = useSharedValue(-20);
  const textOpacity = useSharedValue(0);
  const dividerOpacity = useSharedValue(0);
  const bottomOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    pillOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    pillTranslateY.value = withDelay(200, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
    textOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    dividerOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
    bottomOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(1400, withTiming(1, { duration: 500 }));
  }, []);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ translateY: pillTranslateY.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const dividerStyle = useAnimatedStyle(() => ({ opacity: dividerOpacity.value }));
  const bottomStyle = useAnimatedStyle(() => ({ opacity: bottomOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <GrainBackground>
      <View style={styles.container}>
        {/* 3D Pill capsule SVG */}
        <Animated.View style={[styles.pillWrapper, pillStyle]}>
          <Svg width={120} height={60} viewBox="0 0 120 60">
            <Defs>
              <SvgGradient id="pillGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#444" />
                <Stop offset="0.5" stopColor="#222" />
                <Stop offset="1" stopColor="#111" />
              </SvgGradient>
            </Defs>
            <Rect x="30" y="5" width="60" height="50" rx="25" fill="url(#pillGrad)" />
            <Ellipse cx="60" cy="30" rx="55" ry="25" fill="url(#pillGrad)" opacity="0.9" />
            <Ellipse cx="50" cy="20" rx="20" ry="8" fill="rgba(255,255,255,0.08)" />
          </Svg>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, textStyle]}>
          BẠN ĐÃ TÌM RA{'\n'}SỰ THẬT
        </Animated.Text>

        {/* Mixed weight body text */}
        <Animated.View style={[styles.bodyWrapper, textStyle]}>
          <MixedText
            segments={[
              { text: 'KHÁM PHÁ BP & LOOKSMAXXING ', bold: true, size: 16 },
              { text: 'Ở ĐỘ TUỔI CỦA BẠN ', size: 16 },
              { text: 'GIÚP BẠN CÓ ', size: 16 },
              { text: 'LỢI THẾ CỰC LỚN.', bold: true, size: 16 },
            ]}
          />
        </Animated.View>

        {/* Morse code divider */}
        <Animated.View style={dividerStyle}>
          <MorseCodeDivider />
        </Animated.View>

        {/* Bottom text */}
        <Animated.View style={[styles.bottomTextWrapper, bottomStyle]}>
          <MixedText
            segments={[
              { text: 'BẠN LÀ NGƯỜI KHÁC BIỆT.\n', bold: true, size: 18 },
              { text: 'RẤT ÍT NGƯỜI Ở VỊ TRÍ CỦA BẠN.', size: 14 },
            ]}
          />
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="VẬY TIẾP THEO LÀ GÌ"
            onPress={() => router.push('/(onboarding)/stats')}
          />
        </Animated.View>
      </View>
    </GrainBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  pillWrapper: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 32,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 1,
  },
  bodyWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  bottomTextWrapper: {
    paddingHorizontal: 16,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
