import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import GrainBackground from '../../components/backgrounds/GrainBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import { COLORS, FONTS } from '../../lib/constants';

const STATS = [
  { value: '10,000+', label: 'LƯỢT ĐÁNH GIÁ PSL' },
  { value: '94%', label: 'NGƯỜI DÙNG HÀI LÒNG' },
  { value: '4.8★', label: 'ĐÁNH GIÁ TRUNG BÌNH' },
  { value: '50+', label: 'CHỈ SỐ ĐƯỢC PHÂN TÍCH' },
];

export default function StatsScreen() {
  const router = useRouter();

  const titleOpacity = useSharedValue(0);
  const stat0 = useSharedValue(0);
  const stat1 = useSharedValue(0);
  const stat2 = useSharedValue(0);
  const stat3 = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    stat0.value = withDelay(500, withTiming(1, { duration: 400 }));
    stat1.value = withDelay(700, withTiming(1, { duration: 400 }));
    stat2.value = withDelay(900, withTiming(1, { duration: 400 }));
    stat3.value = withDelay(1100, withTiming(1, { duration: 400 }));
    ctaOpacity.value = withDelay(1400, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const statStyles = [stat0, stat1, stat2, stat3].map((sv) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: sv.value }))
  );
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <GrainBackground>
      <View style={styles.container}>
        <Animated.Text style={[styles.title, titleStyle]}>
          GLOWMAX{'\n'}BẰNG CON SỐ
        </Animated.Text>

        <View style={styles.grid}>
          {STATS.map((stat, i) => (
            <Animated.View key={stat.label} style={[styles.statCard, statStyles[i]]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="TIẾP TỤC"
            onPress={() => router.push('/(onboarding)/goal')}
          />
        </Animated.View>
      </View>
    </GrainBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  statCard: {
    width: '44%',
    backgroundColor: COLORS.GLASS_FILL,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.ACCENT_GOLD,
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.MUTED_GRAY,
    textAlign: 'center',
    letterSpacing: 1,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
