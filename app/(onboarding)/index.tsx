import React, { useEffect } from 'react';
import {View, Text, StyleSheet, Dimensions, Image} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import FrostedButton from '../../components/ui/FrostedButton';
const logo = require('../../assets/images/logo.png');
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
    <TrailBackground>
      <View style={styles.container}>

        {/* Top: logo + title + subtitle */}
        <View style={styles.topBlock}>
          <Animated.View style={[styles.spiralContainer, spiralStyle]}>
            <Image
                source={logo}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text style={[styles.title, titleStyle]}>
            CHÀO MỪNG!
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            HÀNH TRÌNH GLOWUP CỦA BẠN{'\n'}BẮT ĐẦU TỪ ĐÂY.
          </Animated.Text>
        </View>

        {/* Bottom: CTA + sign in */}
        <View style={styles.bottomBlock}>
          <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
            {/*<FrostedButton label="BẮT ĐẦU NGAY" onPress={() => router.push('/(onboarding)/age')} />*/}
            <FrostedButton label="BẮT ĐẦU NGAY" onPress={() => router.push('/(premium)/daily')} />
            {/*<FrostedButton label="BẮT ĐẦU NGAY" onPress={() => router.push('/(main)/results')} />*/}
          </Animated.View>

          <Animated.View style={[styles.linkWrapper, linkStyle]}>
            <Text style={styles.linkText}>
              ĐÃ CÓ TÀI KHOẢN?{' '}
              <Text style={styles.linkUnderline}>ĐĂNG NHẬP</Text>
            </Text>
          </Animated.View>
        </View>

      </View>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SH * 0.15,
    paddingBottom: 52,
    paddingHorizontal: 24,
  },
  topBlock: {
    alignItems: 'center',
  },
  spiralContainer: {
    marginBottom: 32,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 36,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
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
  bottomBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  ctaWrapper: {
    width: '100%',
  },
  linkWrapper: {},
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
