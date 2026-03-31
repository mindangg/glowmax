import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import GrainBackground from '../../components/backgrounds/GrainBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import { COLORS, FONTS } from '../../lib/constants';

const { width: SW, height: SH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const spiralOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const linkOpacity = useSharedValue(0);

  useEffect(() => {
    spiralOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }));
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    linkOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));
  }, []);

  const spiralStyle = useAnimatedStyle(() => ({ opacity: spiralOpacity.value }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));
  const linkStyle = useAnimatedStyle(() => ({ opacity: linkOpacity.value }));

  return (
    <GrainBackground>
      <View style={styles.container}>
        {/* Golden ratio / Fibonacci spiral overlay */}
        <Animated.View style={[styles.spiralContainer, spiralStyle]}>
          <Svg width={SW * 0.8} height={SW * 0.8} viewBox="0 0 200 200">
            <Path
              d="M100,100 Q100,20 180,20 Q180,100 100,100 Q60,100 60,140 Q60,160 80,160 Q100,160 100,140 Q100,130 90,130 Q85,130 85,135"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
              fill="none"
            />
            <Circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" fill="none" />
            <Circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" fill="none" />
          </Svg>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          CHÀO MỪNG!
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          HÀNH TRÌNH GLOWUP CỦA BẠN{'\n'}BẮT ĐẦU TỪ ĐÂY.
        </Animated.Text>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton label="BẮT ĐẦU NGAY" onPress={() => router.push('/(onboarding)/gender')} />
        </Animated.View>

        {/* Sign in link */}
        <Animated.View style={[styles.linkWrapper, linkStyle]}>
          <Text style={styles.linkText}>
            ĐÃ CÓ TÀI KHOẢN?{' '}
            <Text style={styles.linkUnderline}>ĐĂNG NHẬP</Text>
          </Text>
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
  },
  spiralContainer: {
    position: 'absolute',
    top: SH * 0.1,
    alignSelf: 'center',
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 36,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: SH * 0.25,
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    letterSpacing: 1,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
  },
  linkWrapper: {
    position: 'absolute',
    bottom: 60,
  },
  linkText: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.MUTED_GRAY,
    textAlign: 'center',
    letterSpacing: 1,
  },
  linkUnderline: {
    textDecorationLine: 'underline',
    color: COLORS.MUTED_GRAY,
  },
});
