// Premium Scan Tab — Quét
// Shows last scan result and CTA to start a new scan

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import { useTrialScan } from '../../hooks/useTrialScan';
import { useFullAnalysis } from '../../hooks/useFullAnalysis';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, FONTS } from '../../lib/constants';

export default function ScanTab() {
  const router = useRouter();
  const { trialResult, trialState } = useTrialScan();
  const { results: fullResults } = useFullAnalysis();

  // Derive score: prefer full analysis appeal score, fallback to trial
  const fullScore = fullResults?.categories.find((c) => c.category === 'appeal')?.overallScore ?? null;
  const score = fullScore ?? trialResult?.overall_score ?? null;
  const tier = fullResults?.pslResult?.psl_tier ?? null;

  const hasScanned = trialState === 'used' || score !== null;

  const handleScan = () => {
    router.push('/(onboarding)/camera?from=premium');
  };

  return (
    <TrailBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>QUÉT</Text>
          <Text style={styles.subtitle}>PHÂN TÍCH KHUÔN MẶT PSL</Text>
        </Animated.View>

        {/* Score display */}
        {hasScanned && score !== null ? (
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>ĐIỂM PSL CỦA BẠN</Text>
            <Text style={styles.scoreValue}>{score.toFixed(1)}</Text>
            <Text style={styles.scoreDenom}>/10</Text>
            {tier && <Text style={styles.tierLabel}>{tier.toUpperCase()}</Text>}
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(score / 10) * 100}%` as any }]} />
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>CHƯA CÓ DỮ LIỆU</Text>
            <Text style={styles.emptyBody}>
              Thực hiện quét đầu tiên để nhận điểm PSL cá nhân hóa và kế hoạch cải thiện chi tiết.
            </Text>
          </Animated.View>
        )}

        {/* Info row */}
        {hasScanned && score !== null && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>TRẠNG THÁI</Text>
              <Text style={styles.infoCardValue}>PREMIUM</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>PHÂN TÍCH</Text>
              <Text style={styles.infoCardValue}>10 MỤC</Text>
            </View>
          </Animated.View>
        )}

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.actions}>
          <FrostedButton
            label={hasScanned ? 'QUÉT LẠI' : 'BẮT ĐẦU QUÉT'}
            onPress={handleScan}
            variant="gold"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.footer}>
          <Text style={styles.footerText}>PREMIUM — QUÉT KHÔNG GIỚI HẠN</Text>
        </Animated.View>
      </ScrollView>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 3,
    marginBottom: 12,
  },
  scoreValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 72,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 80,
  },
  scoreDenom: {
    fontFamily: FONTS.MONO,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  tierLabel: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 3,
    marginBottom: 20,
  },
  barTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 3,
    backgroundColor: COLORS.TEXT_PRIMARY,
    borderRadius: 2,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    marginBottom: 12,
  },
  emptyBody: {
    fontFamily: 'System',
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    alignItems: 'center',
  },
  infoCardLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
    marginBottom: 6,
  },
  infoCardValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 11,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  actions: {
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1.5,
  },
});
