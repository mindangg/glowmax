// Results Router (Phase 9)
// Entry point after scan animation. Receives photoUri, triggers the appropriate
// API call (trial or full), then renders results in-screen.
//
// NOTE: This file conflicts with results/index.tsx at the same route path
// /(main)/results. Remove results/index.tsx if this file is preferred as the
// single results entry point.
//
// Trial flow:  1st scan → calls trial-scan Edge Function → shows Appeal card + 9 locked
// Paid flow:   calls analyze-face Edge Function → shows all 10 cards unlocked

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  ViewToken,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system/legacy';
import ChromaticGlassBackground from '../../components/backgrounds/ChromaticGlassBackground';
import AppealCard from '../../components/results/AppealCard';
import ResultCard from '../../components/results/ResultCard';
import FrostedButton from '../../components/ui/FrostedButton';
import { useSubscription } from '../../hooks/useSubscription';
import { useTrialScan } from '../../hooks/useTrialScan';
import { useFullAnalysis } from '../../hooks/useFullAnalysis';
import { COLORS, FONTS } from '../../lib/constants';
import { RESULT_CATEGORIES_DATA } from '../../lib/metrics';
import { ResultCategory } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

const CATEGORY_ORDER: ResultCategory[] = [
  'appeal', 'jaw', 'eyes', 'orbitals', 'zygos',
  'harmony', 'nose', 'hair', 'ascension', 'leanmax',
];

export default function ResultsRouter() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { isPaid, isTrialUsed, markTrialUsed } = useSubscription();
  const { triggerTrialScan, trialResult } = useTrialScan();
  const { triggerAnalysis, results: fullResults } = useFullAnalysis();

  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [activeIndex, setActiveIndex] = useState(0);
  const triggered = useRef(false);

  // Trigger the appropriate API call once on mount
  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const run = async () => {
      setApiStatus('loading');
      try {
        // Convert photoUri to base64 for the Edge Function
        let photoBase64 = '';
        if (photoUri) {
          try {
            photoBase64 = await FileSystem.readAsStringAsync(photoUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          } catch {
            // Photo read failed — Edge Function will use fallback/mock
          }
        }

        if (isPaid) {
          // Full analysis for paid users
          await triggerAnalysis(photoBase64);
        } else if (!isTrialUsed) {
          // First-time trial scan
          await triggerTrialScan(photoBase64);
          markTrialUsed();
        }
        // If trial already used and not paid: show all-locked state, no API call
        setApiStatus('done');
      } catch {
        setApiStatus('error');
      }
    };

    run();
  }, []);

  const onViewableChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Determine lock state per category
  const isCardLocked = useCallback(
    (category: ResultCategory): boolean => {
      if (isPaid) return false;
      // 1st trial scan just completed: unlock Appeal only
      if (!isTrialUsed && category === 'appeal') return false;
      // Trial already used before this scan: everything locked
      return true;
    },
    [isPaid, isTrialUsed]
  );

  const renderItem = useCallback(
    ({ item }: { item: ResultCategory }) => {
      const locked = isCardLocked(item);

      if (item === 'appeal') {
        return (
          <View style={{ width: CARD_WIDTH, paddingVertical: 20 }}>
            <AppealCard
              score={
                isPaid && fullResults
                  ? fullResults.find((r) => r.category === 'appeal')?.overallScore ?? null
                  : trialResult?.overall_score ?? null
              }
              rank={trialResult?.rank ?? null}
              totalUsers={trialResult?.total_users ?? null}
              locked={locked}
            />
          </View>
        );
      }

      const catData = RESULT_CATEGORIES_DATA.find((c) => c.category === item);
      const fullData = fullResults?.find((r) => r.category === item);

      return (
        <View style={{ width: CARD_WIDTH, paddingVertical: 20 }}>
          <ResultCard
            title={catData?.title ?? item.toUpperCase()}
            metrics={fullData?.metrics ?? []}
            overallScore={fullData?.overallScore ?? 0}
            locked={locked}
          />
        </View>
      );
    },
    [isCardLocked, isPaid, fullResults, trialResult]
  );

  const handleCTA = () => {
    router.push('/(main)/paywall');
  };

  const handleHome = () => {
    router.replace('/(main)/');
  };

  // --- Loading state ---
  if (apiStatus === 'loading') {
    return (
      <ChromaticGlassBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ACCENT_GOLD} />
          <Animated.Text
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.loadingText}
          >
            ĐANG PHÂN TÍCH...
          </Animated.Text>
          <Text style={styles.loadingSubText}>
            {isPaid ? 'PHÂN TÍCH ĐẦY ĐỦ 12+ CHỈ SỐ' : 'TÍNH ĐIỂM PSL CỦA BẠN'}
          </Text>
        </View>
      </ChromaticGlassBackground>
    );
  }

  // --- Error state ---
  if (apiStatus === 'error') {
    return (
      <ChromaticGlassBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorText}>PHÂN TÍCH THẤT BẠI</Text>
          <Text style={styles.errorSub}>Vui lòng thử lại.</Text>
          <View style={{ marginTop: 24 }}>
            <FrostedButton label="VỀ TRANG CHỦ" onPress={handleHome} variant="default" />
          </View>
        </View>
      </ChromaticGlassBackground>
    );
  }

  // --- Results state (done or idle = show whatever data exists) ---
  return (
    <ChromaticGlassBackground>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <Text style={styles.headerTitle}>KẾT QUẢ CỦA BẠN</Text>
          <Text style={styles.headerSub}>
            {isPaid
              ? 'PHÂN TÍCH ĐẦY ĐỦ'
              : isTrialUsed
              ? 'BẢN XEM TRƯỚC'
              : 'TẤT CẢ BỊ KHÓA'}
          </Text>
        </Animated.View>

        {/* Ranking banner */}
        {trialResult && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.rankBanner}>
            <Text style={styles.rankBannerText}>
              BẠN ĐANG HẠNG{' '}
              <Text style={styles.rankBannerHighlight}>
                {trialResult.rank}/{trialResult.total_users}
              </Text>
            </Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ flex: 1 }}>
          <FlatList
            data={CATEGORY_ORDER}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20 }}
            onViewableItemsChanged={onViewableChanged}
            viewabilityConfig={viewConfig}
          />
        </Animated.View>

        {/* Pagination dots */}
        <View style={styles.dotsContainer}>
          {CATEGORY_ORDER.map((cat, i) => (
            <View
              key={cat}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* CTAs */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.ctaWrapper}>
          {!isPaid ? (
            <FrostedButton label="XEM KẾT QUẢ ĐẦY ĐỦ" onPress={handleCTA} variant="gold" />
          ) : (
            <FrostedButton label="VỀ TRANG CHỦ" onPress={handleHome} variant="default" />
          )}
        </Animated.View>
      </View>
    </ChromaticGlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: 36,
  },

  // Loading / error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  loadingText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 3,
  },
  loadingSubText: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  errorIcon: {
    fontSize: 40,
    color: COLORS.ACCENT_GOLD,
  },
  errorText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
  },
  errorSub: {
    fontFamily: 'System',
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 26,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
  },
  headerSub: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
    marginTop: 4,
  },

  // Rank banner
  rankBanner: {
    alignItems: 'center',
    marginBottom: 8,
  },
  rankBannerText: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  rankBannerHighlight: {
    color: COLORS.ACCENT_GOLD,
    fontFamily: FONTS.MONO_BOLD,
  },

  // Pagination
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: COLORS.ACCENT_GOLD,
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // CTA
  ctaWrapper: {
    marginTop: 20,
  },
});
