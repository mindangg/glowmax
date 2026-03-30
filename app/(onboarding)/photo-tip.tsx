import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Rect, Path } from 'react-native-svg';
import ChromaticGlassBackground from '../../components/backgrounds/ChromaticGlassBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import { COLORS, FONTS } from '../../lib/constants';

const TIPS = [
  { icon: '💡', text: 'ÁNH SÁNG TỰ NHIÊN, CHÍNH DIỆN' },
  { icon: '📐', text: 'GIỮ ĐIỆN THOẠI NGANG TẦM MẮT' },
  { icon: '😐', text: 'GIỮ KHUÔN MẶT TỰ NHIÊN, KHÔNG CƯỜI' },
  { icon: '👓', text: 'BỎ KÍNH NẾU CÓ THỂ' },
  { icon: '🔒', text: 'ẢNH ĐƯỢC BẢO MẬT 100% — KHÔNG TẢI LÊN SERVER' },
];

export default function PhotoTipScreen() {
  const router = useRouter();

  const titleOpacity = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const tipsOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    iconOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    tipsOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const iconStyle = useAnimatedStyle(() => ({ opacity: iconOpacity.value }));
  const tipsStyle = useAnimatedStyle(() => ({ opacity: tipsOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <ChromaticGlassBackground>
      <View style={styles.container}>
        <Animated.Text style={[styles.title, titleStyle]}>
          TRƯỚC KHI CHỤP
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, titleStyle]}>
          ĐỌC KỸ ĐỂ CÓ KẾT QUẢ CHÍNH XÁC NHẤT
        </Animated.Text>

        {/* Camera icon */}
        <Animated.View style={[styles.cameraIcon, iconStyle]}>
          <Svg width={80} height={80} viewBox="0 0 80 80">
            <Rect x="10" y="25" width="60" height="40" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <Circle cx="40" cy="45" r="14" fill="none" stroke={COLORS.ACCENT_GOLD} strokeWidth="1.5" />
            <Circle cx="40" cy="45" r="6" fill={COLORS.ACCENT_GOLD} opacity="0.3" />
            <Rect x="28" y="20" width="24" height="8" rx="3" fill="rgba(255,255,255,0.1)" />
          </Svg>
        </Animated.View>

        {/* Tips list */}
        <Animated.View style={[styles.tipsList, tipsStyle]}>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="MỞ CAMERA"
            onPress={() => router.push('/(onboarding)/camera')}
          />
        </Animated.View>
      </View>
    </ChromaticGlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.MUTED_GRAY,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
  cameraIcon: {
    marginVertical: 32,
  },
  tipsList: {
    width: '100%',
    gap: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GLASS_FILL,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  tipText: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    letterSpacing: 0.5,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
