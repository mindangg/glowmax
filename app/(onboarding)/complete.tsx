import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {useRouter} from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Circle, Path} from 'react-native-svg';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import {COLORS, FONTS} from '../../lib/constants';

export default function CompleteScreen() {
  const router = useRouter();

  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    checkOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    checkScale.value = withDelay(300, withSequence(
      withTiming(1.15, { duration: 300, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200 }),
    ));
    titleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    subtitleOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(1300, withTiming(1, { duration: 500 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <TrailBackground>
      <View style={styles.container}>
        {/* Checkmark icon */}
        <Animated.View style={[styles.checkWrapper, checkStyle]}>
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="45" fill="rgba(232,197,111,0.1)" stroke={COLORS.ACCENT_GOLD} strokeWidth="2" />
            <Path
              d="M30 52 L44 66 L70 36"
              stroke={COLORS.ACCENT_GOLD}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          SẴN SÀNG!
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          ẢNH ĐÃ ĐƯỢC CHỤP.{'\n'}
          BÂY GIỜ HÃY ĐỂ AI PHÂN TÍCH{'\n'}
          KHUÔN MẶT CỦA BẠN.
        </Animated.Text>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="BẮT ĐẦU QUÉT PSL"
            variant="gold"
            onPress={() => router.push('/(onboarding)/username')}
          />
        </Animated.View>
      </View>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  checkWrapper: {
    marginBottom: 32,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 36,
    color: COLORS.ACCENT_GOLD,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.MUTED_GRAY,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
