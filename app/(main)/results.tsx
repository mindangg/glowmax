// Results Router (Phase 9)
// Entry point after scan animation. Receives photoUri, triggers the appropriate
// API call (trial or full), then renders results in-screen.

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  ViewToken,
  Image,
  StatusBar,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system/legacy';
import GrainBackground from '../../components/backgrounds/GrainBackground';
import AppealCard from '../../components/results/AppealCard';
import ResultCard from '../../components/results/ResultCard';
import PSLCard from '../../components/results/PSLCard';
import FrostedButton from '../../components/ui/FrostedButton';
import { useSubscription } from '../../hooks/useSubscription';
import { useTrialScan } from '../../hooks/useTrialScan';
import { useFullAnalysis } from '../../hooks/useFullAnalysis';
import { COLORS, FONTS } from '../../lib/constants';
import { RESULT_CATEGORIES_DATA } from '../../lib/metrics';
import { ResultCategory } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - 48;

type CarouselItem = 'psl' | ResultCategory;

export default function ResultsRouter() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { isPaid, isTrialUsed, markTrialUsed } = useSubscription();
  const { triggerTrialScan, trialResult } = useTrialScan();
  const { triggerAnalysis, results: fullResults } = useFullAnalysis();

  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [activeIndex, setActiveIndex] = useState(0);
  const triggered = useRef(false);

  // Build category order — PSL included for all users (locked for trial)
  const CATEGORY_ORDER: CarouselItem[] = [
    'psl', 'appeal', 'jaw', 'eyes', 'orbitals', 'zygos', 'harmony', 'nose', 'hair', 'ascension', 'leanmax',
  ];

  // Trigger the appropriate API call once on mount
  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const run = async () => {
      setApiStatus('loading');
      try {
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
          await triggerAnalysis(photoBase64);
        } else if (!isTrialUsed) {
          await triggerTrialScan(photoBase64);
          markTrialUsed();
        }
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

  const isCardLocked = useCallback(
    (category: CarouselItem): boolean => {
      if (isPaid) return false;
      // Trial users: everything is locked
      return true;
    },
    [isPaid]
  );

  const renderItem = useCallback(
    ({ item }: { item: CarouselItem }) => {
      // PSL Card — shown for all users, locked for trial
      if (item === 'psl') {
        const locked = isCardLocked(item);
        const pslData = fullResults?.pslResult;
        return (
          <View style={{ width: CARD_WIDTH, paddingVertical: 10, marginHorizontal: CARD_GAP / 2 }}>
            <PSLCard
              pslTier={pslData?.psl_tier ?? 'LTN'}
              potentialTier={pslData?.potential_tier ?? 'HTN'}
              date={pslData?.date ?? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              locked={locked}
            />
          </View>
        );
      }

      const locked = isCardLocked(item);

      // Appeal Card
      if (item === 'appeal') {
        const appealData = fullResults?.categories.find((r) => r.category === 'appeal');
        return (
          <View style={{ width: CARD_WIDTH, paddingVertical: 10, marginHorizontal: CARD_GAP / 2 }}>
            <AppealCard
              score={isPaid && appealData ? appealData.overallScore : null}
              locked={locked}
            />
          </View>
        );
      }

      // Result Cards
      const catData = RESULT_CATEGORIES_DATA.find((c) => c.category === item);
      const fullData = fullResults?.categories.find((r) => r.category === item);

      return (
        <View style={{ width: CARD_WIDTH, paddingVertical: 10, marginHorizontal: CARD_GAP / 2 }}>
          <ResultCard
            title={catData?.title ?? item.toUpperCase()}
            metrics={fullData?.metrics ?? []}
            overallScore={fullData?.overallScore ?? 0}
            locked={locked}
            category={item}
          />
        </View>
      );
    },
    [isCardLocked, isPaid, fullResults]
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
      <GrainBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ACCENT_GOLD} />
          <Animated.Text
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.loadingText}
          >
            ANALYZING...
          </Animated.Text>
          <Text style={styles.loadingSubText}>
            {isPaid ? 'FULL ANALYSIS 12+ METRICS' : 'CALCULATING YOUR PSL SCORE'}
          </Text>
        </View>
      </GrainBackground>
    );
  }

  // --- Error state ---
  if (apiStatus === 'error') {
    return (
      <GrainBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorText}>ANALYSIS FAILED</Text>
          <Text style={styles.errorSub}>Please try again.</Text>
          <View style={{ marginTop: 24 }}>
            <FrostedButton label="GO HOME" onPress={handleHome} variant="default" />
          </View>
        </View>
      </GrainBackground>
    );
  }

  // --- Results state ---
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen frontside photo background */}
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#0A0C0E' }]} />
      )}

      {/* Dark gradient overlay — heavier at bottom where cards live */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayBottom} />

      <View style={styles.container}>
        {/* Cards — pushed to bottom, photo visible above */}
        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.cardsArea}>
          <FlatList
            data={CATEGORY_ORDER}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 24 - CARD_GAP / 2 }}
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
            <Pressable style={styles.seeFullResultsBtn} onPress={handleCTA}>
              <Text style={styles.seeFullResultsText}>SEE FULL RESULTS</Text>
            </Pressable>
          ) : (
            <FrostedButton label="GO HOME" onPress={handleHome} variant="default" />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlayTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    height: SCREEN_HEIGHT * 0.5,
    bottom: undefined,
  },
  overlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.65,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  container: {
    flex: 1,
    paddingBottom: 36,
  },
  cardsArea: {
    height: SCREEN_HEIGHT * 0.52,
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
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: COLORS.ACCENT_GOLD,
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // CTA
  ctaWrapper: {
    marginTop: 16,
    paddingHorizontal: 20,
  },

  // "SEE FULL RESULTS" white pill button
  seeFullResultsBtn: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  seeFullResultsText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: '#000',
    letterSpacing: 1.5,
  },
});
