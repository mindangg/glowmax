import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import ChromaticGlassBackground from '../../../components/backgrounds/ChromaticGlassBackground';
import BackArrow from '../../../components/ui/BackArrow';
import { useSubscription } from '../../../hooks/useSubscription';
import { useFullAnalysis } from '../../../hooks/useFullAnalysis';
import { useTrialScan } from '../../../hooks/useTrialScan';
import { COLORS, FONTS } from '../../../lib/constants';
import { ResultCategory, MetricScore } from '../../../types';

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(Math.max((score / 10) * 100, 0), 100);
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%` }]} />
    </View>
  );
}

function MetricDetail({ metric, index }: { metric: MetricScore; index: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      style={styles.metricCard}
    >
      <View style={styles.metricHeader}>
        <View style={styles.metricInfo}>
          <Text style={styles.metricName}>{metric.name}</Text>
          <Text style={styles.metricSub}>{metric.subtitle}</Text>
        </View>
        <Text style={styles.metricScore}>{metric.score.toFixed(1)}</Text>
      </View>

      <ScoreBar score={metric.score} />

      <Text style={styles.metricDesc}>{metric.description}</Text>

      {metric.tips.length > 0 && (
        <View style={styles.tipsBox}>
          {metric.tips.map((tip, i) => (
            <Text key={i} style={styles.tipItem}>• {tip}</Text>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

export default function CategoryDetailScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { isPaid } = useSubscription();
  const { results } = useFullAnalysis();
  const { trialResult } = useTrialScan();

  // Redirect unpaid users to paywall
  if (!isPaid) {
    return (
      <ChromaticGlassBackground>
        <View style={styles.container}>
          <BackArrow onPress={() => router.back()} />
          <View style={styles.lockedContainer}>
            <Text style={styles.lockLargeIcon}>🔒</Text>
            <Text style={styles.lockedTitle}>NỘI DUNG ĐÃ KHÓA</Text>
            <Text style={styles.lockedSub}>
              Mua gói để xem phân tích chi tiết
            </Text>
            <TouchableOpacity
              style={styles.paywallBtn}
              onPress={() => router.push('/(main)/paywall')}
            >
              <Text style={styles.paywallBtnText}>MỞ KHÓA NGAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ChromaticGlassBackground>
    );
  }

  const catData = results?.find((r) => r.category === (category as ResultCategory));

  // Appeal category gets special handling with rank
  const isAppeal = category === 'appeal';

  return (
    <ChromaticGlassBackground>
      <View style={styles.container}>
        <BackArrow onPress={() => router.back()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(500)} style={styles.headerSection}>
            <Text style={styles.categoryTitle}>
              {catData?.title ?? (category as string).toUpperCase()}
            </Text>

            {catData && (
              <>
                <Text style={styles.overallScore}>
                  {catData.overallScore.toFixed(1)}/10
                </Text>
                <ScoreBar score={catData.overallScore} />
              </>
            )}

            {isAppeal && trialResult && (
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>
                  BẠN ĐANG HẠNG {trialResult.rank}/{trialResult.total_users}
                </Text>
              </View>
            )}
          </Animated.View>

          {catData?.metrics.map((metric, i) => (
            <MetricDetail key={metric.name} metric={metric} index={i} />
          ))}

          {!catData && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Chưa có dữ liệu cho danh mục này
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ChromaticGlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  overallScore: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 48,
    color: COLORS.ACCENT_GOLD,
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: 'rgba(232,197,111,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,197,111,0.2)',
    marginTop: 12,
  },
  rankText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  metricCard: {
    backgroundColor: COLORS.BACKGROUND_ELEVATED,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricSub: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
    marginTop: 2,
  },
  metricScore: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 24,
    color: COLORS.ACCENT_GOLD,
    marginLeft: 12,
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: 2,
  },
  metricDesc: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  tipsBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tipItem: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 4,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  lockLargeIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  lockedTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 22,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    marginBottom: 8,
  },
  lockedSub: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  paywallBtn: {
    backgroundColor: COLORS.ACCENT_GOLD,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  paywallBtnText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: '#1A1A1A',
    letterSpacing: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});
