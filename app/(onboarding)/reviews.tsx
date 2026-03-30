import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import ChromaticGlassBackground from '../../components/backgrounds/ChromaticGlassBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import { COLORS, FONTS } from '../../lib/constants';

const { width: SW } = Dimensions.get('window');

const REVIEWS = [
  {
    name: 'MINH T.',
    stars: 5,
    text: 'APP NÀY ĐÃ THAY ĐỔI CÁCH TÔI NHÌN NHẬN BẢN THÂN. PHÂN TÍCH RẤT CHI TIẾT VÀ CHÍNH XÁC.',
  },
  {
    name: 'KHANG N.',
    stars: 5,
    text: 'SAU 2 THÁNG THEO ASCENSION PLAN, KHUÔN MẶT TÔI ĐÃ CẢI THIỆN RÕ RỆT. ĐÁNG TỪNG ĐỒNG.',
  },
  {
    name: 'DUY P.',
    stars: 5,
    text: 'ĐIỂM PSL CỦA TÔI TĂNG TỪ 5.8 LÊN 7.1 TRONG 3 THÁNG. KHÔNG THỂ TIN ĐƯỢC.',
  },
  {
    name: 'AN V.',
    stars: 4,
    text: 'GIAO DIỆN ĐẸP, PHÂN TÍCH CHUYÊN SÂU. ƯỚC GÌ BIẾT APP NÀY SỚM HƠN.',
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: count }).map((_, i) => (
        <Text key={i} style={styles.star}>★</Text>
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const router = useRouter();
  const [hasScrolled, setHasScrolled] = useState(false);

  const bannerOpacity = useSharedValue(0);
  const listOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    bannerOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    listOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  const bannerStyle = useAnimatedStyle(() => ({ opacity: bannerOpacity.value }));
  const listStyle = useAnimatedStyle(() => ({ opacity: listOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <ChromaticGlassBackground iridescent>
      <View style={styles.container}>
        {/* Review banner */}
        <Animated.View style={[styles.banner, bannerStyle]}>
          <Text style={styles.bannerIcon}>⭐</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>ĐỂ LẠI ĐÁNH GIÁ</Text>
            <Text style={styles.bannerSubtitle}>4.8 / 5.0 — 10,000+ ĐÁNH GIÁ</Text>
          </View>
        </Animated.View>

        {/* Scrollable testimonials */}
        <Animated.View style={[styles.scrollWrapper, listStyle]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              if (e.nativeEvent.contentOffset.y > 50) setHasScrolled(true);
            }}
            scrollEventThrottle={16}
          >
            {REVIEWS.map((review, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <StarRow count={review.stars} />
                </View>
                <Text style={styles.reviewBody}>{review.text}</Text>
              </View>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="TIẾP TỤC"
            onPress={() => router.push('/(onboarding)/height-weight')}
            disabled={!hasScrolled}
          />
        </Animated.View>
      </View>
    </ChromaticGlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GLASS_FILL,
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  bannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  bannerSubtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.MUTED_GRAY,
    marginTop: 4,
  },
  scrollWrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
  reviewCard: {
    backgroundColor: COLORS.GLASS_FILL,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewName: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 14,
    color: COLORS.ACCENT_GOLD,
  },
  reviewBody: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
