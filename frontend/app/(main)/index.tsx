// Home Screen (Phase 9)
// Main hub after onboarding. Shows ranking, last scan score, and re-scan CTA.
// Background B (TrailBackground).

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import { useSubscription } from '../../hooks/useSubscription';
import { useTrialScan } from '../../hooks/useTrialScan';
import { COLORS, FONTS } from '../../lib/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { isPaid, subscriptionStatus } = useSubscription();
  const { trialResult, trialState } = useTrialScan();

  // Redirect paid users to premium tabs
  useEffect(() => {
    if (isPaid) {
      router.replace('/(premium)/scan');
    }
  }, [isPaid]);

  const hasScanned = trialState === 'used' || (isPaid && trialResult !== null);
  const score = trialResult?.overall_score ?? null;
  const rank = trialResult?.rank ?? null;
  const totalUsers = trialResult?.total_users ?? null;

  const handleScan = () => {
    // Navigate to camera in onboarding flow for photo capture, then to scan animation
    router.push('/(onboarding)/photo-capture');
  };

  const handleViewResults = () => {
    router.push('/(main)/results');
  };

  const handleLeaderboard = () => { router.push(`/(main)/leaderboard?myRank=${rank}`); };

  const handleProfile = () => {
    router.push('/(main)/profile');
  };

  const statusLabel =
    subscriptionStatus === 'active'
      ? 'PREMIUM'
      : subscriptionStatus === 'trial'
      ? 'MIỄN PHÍ'
      : 'HẾT LƯỢT';

  const statusColor =
    subscriptionStatus === 'active' ? COLORS.ACCENT_GOLD : 'rgba(255,255,255,0.4)';

  return (
    <TrailBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.topBar}>
          <Text style={styles.logoText}>GLOWMAX</Text>
          <TouchableOpacity onPress={handleProfile} style={styles.profileBtn} activeOpacity={0.7}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>
                {subscriptionStatus === 'active' ? '★' : '◎'}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Ranking card — shown after first scan */}
        {hasScanned && rank !== null && totalUsers !== null ? (
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.rankCard}>
            <LinearGradient
              colors={['rgba(232,197,111,0.15)', 'rgba(232,197,111,0.05)']}
              style={styles.rankCardInner}
            >
              <Text style={styles.rankLabel}>XẾP HẠNG CỦA BẠN</Text>
              <Text style={styles.rankValue}>
                <Text style={styles.rankNumber}>{rank}</Text>
                <Text style={styles.rankDivider}>/</Text>
                <Text style={styles.rankTotal}>{totalUsers}</Text>
              </Text>
              <Text style={styles.rankSub}>BẠN ĐANG HẠNG {rank}/{totalUsers}</Text>
              <TouchableOpacity onPress={handleLeaderboard} style={styles.leaderboardLink} activeOpacity={0.7}>
                <Text style={styles.leaderboardLinkText}>XEM BẢNG XẾP HẠNG →</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.rankCard}>
            <View style={styles.rankCardInner}>
              <Text style={styles.rankLabel}>XẾP HẠNG</Text>
              <Text style={styles.rankPlaceholder}>—/—</Text>
              <Text style={styles.rankSub}>CHƯA QUÉT LẦN NÀO</Text>
            </View>
          </Animated.View>
        )}

        {/* Score card — shown if user has a score */}
        {score !== null ? (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreBlock}>
                <Text style={styles.scoreLabel}>ĐIỂM PSL</Text>
                <Text style={styles.scoreValue}>{score.toFixed(1)}</Text>
                <Text style={styles.scoreSuffix}>/10</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreBlock}>
                <Text style={styles.scoreLabel}>TRẠNG THÁI</Text>
                <Text style={[styles.scoreValue, { color: statusColor, fontSize: 14 }]}>
                  {statusLabel}
                </Text>
                {!isPaid && (
                  <Text style={styles.scoreLock}>9 MỤC BỊ KHÓA</Text>
                )}
              </View>
            </View>

            {/* Score bar */}
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(score / 10) * 100}%` as any }]} />
            </View>
          </Animated.View>
        ) : null}

        {/* Empty state — no scan yet */}
        {!hasScanned && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>◈</Text>
            <Text style={styles.emptyTitle}>SẴN SÀNG KHÁM PHÁ?</Text>
            <Text style={styles.emptyBody}>
              Quét khuôn mặt của bạn để nhận điểm PSL cá nhân hóa và kế hoạch cải thiện chi tiết.
            </Text>
          </Animated.View>
        )}

        {/* Action buttons */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.actions}>
          <FrostedButton
            label={hasScanned ? 'QUÉT LẠI' : 'QUÉT KHUÔN MẶT'}
            onPress={handleScan}
            variant="gold"
          />

          {hasScanned && (
            <View style={styles.secondaryBtnWrap}>
              <FrostedButton
                label="XEM KẾT QUẢ"
                onPress={handleViewResults}
                variant="default"
              />
            </View>
          )}
        </Animated.View>

        {/* Info footer */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.footer}>
          {!isPaid ? (
            <Text style={styles.footerText}>
              {trialState === 'used'
                ? 'ĐÃ DÙNG LƯỢT QUÉT MIỄN PHÍ • NÂNG CẤP ĐỂ QUÉT KHÔNG GIỚI HẠN'
                : '1 LƯỢT QUÉT MIỄN PHÍ CÒN LẠI'}
            </Text>
          ) : (
            <Text style={styles.footerText}>PREMIUM • QUÉT KHÔNG GIỚI HẠN</Text>
          )}
        </Animated.View>
      </ScrollView>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 56,
    paddingBottom: 48,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  logoText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 22,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 4,
  },
  profileBtn: {
    position: 'relative',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
  },
  statusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.BACKGROUND_PRIMARY,
  },

  // Rank card
  rankCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(232,197,111,0.2)',
  },
  rankCardInner: {
    padding: 20,
    alignItems: 'center',
  },
  rankLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  rankValue: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rankNumber: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 52,
    color: COLORS.ACCENT_GOLD,
    lineHeight: 56,
  },
  rankDivider: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: 'rgba(232,197,111,0.5)',
    lineHeight: 56,
    marginHorizontal: 4,
  },
  rankTotal: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: 'rgba(232,197,111,0.7)',
    lineHeight: 56,
  },
  rankSub: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
    marginTop: 6,
  },
  rankPlaceholder: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 52,
    color: 'rgba(255,255,255,0.15)',
    lineHeight: 60,
  },
  leaderboardLink: {
    marginTop: 12,
    paddingVertical: 4,
  },
  leaderboardLinkText: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 2,
    opacity: 0.8,
  },

  // Score card
  scoreCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreBlock: {
    flex: 1,
    alignItems: 'center',
  },
  scoreDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scoreLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 32,
    color: COLORS.ACCENT_GOLD,
    lineHeight: 36,
  },
  scoreSuffix: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  scoreLock: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    marginTop: 2,
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: 2,
  },

  // Empty state
  emptyCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    color: COLORS.ACCENT_GOLD,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: 'System',
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Actions
  actions: {
    marginTop: 8,
    gap: 12,
  },
  secondaryBtnWrap: {
    marginTop: 0,
  },

  // Footer
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  footerText: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
