import React, { useEffect } from 'react';
import {View, StyleSheet, Dimensions, Image} from 'react-native';
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

const clock = require('../../assets/images/clock.png');


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
          <Image
              style={{ width: 150, height: 120 }}
              source={clock}
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
    paddingTop: 50,
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
