import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import BackArrow from '../../components/ui/BackArrow';
import OptionCard from '../../components/ui/OptionCard';
import FrostedButton from '../../components/ui/FrostedButton';
import { useOnboarding } from '../../hooks/useOnboarding';
import { FONTS, COLORS } from '../../lib/constants';

const LEVELS = [
  { key: 'casual', label: 'THỬ XEM SAO' },
  { key: 'moderate', label: 'SẴN SÀNG ĐẦU TƯ THỜI GIAN' },
  { key: 'serious', label: 'RẤT NGHIÊM TÚC' },
  { key: 'all_in', label: 'ALL-IN — THAY ĐỔI CUỘC ĐỜI' },
];

export default function CommitmentScreen() {
  const router = useRouter();
  const { answers, setAnswer } = useOnboarding();

  const titleOpacity = useSharedValue(0);
  const optionsOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    optionsOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const optionsStyle = useAnimatedStyle(() => ({ opacity: optionsOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <TrailBackground>
      <BackArrow />
      <View style={styles.container}>
        <Animated.Text style={[styles.title, titleStyle]}>
          MỨC ĐỘ CAM KẾT{'\n'}CỦA BẠN?
        </Animated.Text>

        <Animated.View style={optionsStyle}>
          {LEVELS.map((l) => (
            <OptionCard
              key={l.key}
              label={l.label}
              selected={answers.commitment === l.key}
              onPress={() => setAnswer('commitment', l.key)}
            />
          ))}
        </Animated.View>

        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="TIẾP TỤC"
            onPress={() => router.push('/(onboarding)/reviews')}
            disabled={!answers.commitment}
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
    marginTop: -100,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 1,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
