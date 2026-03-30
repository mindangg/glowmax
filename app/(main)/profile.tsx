// Profile Screen (Phase 9)
// Shows subscription status, manage plan, user stats.
// Background B (ChromaticGlassBackground).

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import ChromaticGlassBackground from '../../components/backgrounds/ChromaticGlassBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import { useSubscription } from '../../hooks/useSubscription';
import { useTrialScan } from '../../hooks/useTrialScan';
import { COLORS, FONTS } from '../../lib/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    isPaid,
    subscriptionStatus,
    restorePurchases,
  } = useSubscription();
  const { trialResult, trialState } = useTrialScan();

  const [isRestoring, setIsRestoring] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleManagePlan = () => {
    router.push('/(main)/paywall');
  };

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.restored) {
        Alert.alert('Thành công', 'Đã khôi phục gói Premium của bạn.');
      } else {
        Alert.alert('Không tìm thấy', 'Không tìm thấy giao dịch nào để khôi phục.');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể khôi phục. Vui lòng thử lại.');
    } finally {
      setIsRestoring(false);
    }
  }, [restorePurchases]);

  const score = trialResult?.overall_score ?? null;
  const rank = trialResult?.rank ?? null;
  const totalUsers = trialResult?.total_users ?? null;
  const scansUsed = trialState === 'used' ? 1 : 0;

  const subscriptionLabel =
    subscriptionStatus === 'active'
      ? 'PREMIUM ACTIVE'
      : subscriptionStatus === 'expired'
      ? 'HẾT LƯỢT MIỄN PHÍ'
      : 'MIỄN PHÍ';

  const subscriptionColor =
    subscriptionStatus === 'active' ? COLORS.ACCENT_GOLD : COLORS.TEXT_SECONDARY;

  return (
    <ChromaticGlassBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar with back */}
        <Animated.View entering={FadeInDown.duration(350)} style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>HỒ SƠ</Text>
          <View style={styles.backBtn} />
        </Animated.View>

        {/* Subscription status card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          {isPaid ? (
            <LinearGradient
              colors={['rgba(232,197,111,0.18)', 'rgba(201,150,58,0.08)']}
              style={styles.subCard}
            >
              <View style={styles.subCardHeader}>
                <Text style={styles.subBadge}>★ PREMIUM</Text>
                <View style={styles.subActiveDot} />
              </View>
              <Text style={styles.subLabel}>GÓI ĐANG HOẠT ĐỘNG</Text>
              <Text style={styles.subDesc}>Quét không giới hạn • Tất cả 10 danh mục</Text>
            </LinearGradient>
          ) : (
            <View style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Text style={[styles.subBadge, { color: subscriptionColor }]}>
                  {subscriptionLabel}
                </Text>
              </View>
              <Text style={styles.subLabel}>
                {subscriptionStatus === 'expired'
                  ? 'ĐÃ DÙNG LƯỢT MIỄN PHÍ'
                  : '1 LƯỢT QUÉT MIỄN PHÍ'}
              </Text>
              <Text style={styles.subDesc}>
                {subscriptionStatus === 'expired'
                  ? 'Nâng cấp để tiếp tục phân tích'
                  : scansUsed === 0
                  ? 'Chưa sử dụng lượt nào'
                  : 'Đã sử dụng 1/1 lượt'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{score !== null ? score.toFixed(1) : '—'}</Text>
            <Text style={styles.statLabel}>ĐIỂM PSL</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{rank !== null ? String(rank) : '—'}</Text>
            <Text style={styles.statLabel}>XẾP HẠNG</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{totalUsers !== null ? String(totalUsers) : '—'}</Text>
            <Text style={styles.statLabel}>TỔNG NGƯỜI</Text>
          </View>
        </Animated.View>

        {/* Ranking display */}
        {rank !== null && totalUsers !== null && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.rankRow}>
            <Text style={styles.rankText}>
              BẠN ĐANG HẠNG{' '}
              <Text style={styles.rankHighlight}>{rank}/{totalUsers}</Text>
            </Text>
          </Animated.View>
        )}

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Menu items */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>TÀI KHOẢN</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleManagePlan}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>◈</Text>
              <Text style={styles.menuItemLabel}>
                {isPaid ? 'QUẢN LÝ GÓI' : 'NÂNG CẤP LÊN PREMIUM'}
              </Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, isRestoring && styles.menuItemDisabled]}
            onPress={handleRestore}
            disabled={isRestoring}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>↺</Text>
              <Text style={styles.menuItemLabel}>
                {isRestoring ? 'ĐANG KHÔI PHỤC...' : 'KHÔI PHỤC MUA HÀNG'}
              </Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.sectionDivider} />

        {/* Upgrade CTA for non-paid */}
        {!isPaid && (
          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.upgradeCta}>
            <Text style={styles.upgradeTitle}>MỞ KHÓA ĐẦY ĐỦ</Text>
            <Text style={styles.upgradeBody}>
              Phân tích 12+ chỉ số khuôn mặt{'\n'}Kế hoạch cải thiện cá nhân hóa{'\n'}Quét không giới hạn
            </Text>
            <View style={styles.upgradeBtn}>
              <FrostedButton
                label="NÂNG CẤP NGAY"
                onPress={handleManagePlan}
                variant="gold"
              />
            </View>
          </Animated.View>
        )}

        {/* App info */}
        <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.appInfo}>
          <Text style={styles.appInfoText}>GLOWMAX v1.0</Text>
          <Text style={styles.appInfoText}>React Native + Expo SDK 55</Text>
        </Animated.View>
      </ScrollView>
    </ChromaticGlassBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 52,
    paddingBottom: 48,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backChevron: {
    fontSize: 32,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 36,
  },
  pageTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 4,
  },

  // Subscription card
  subCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  subBadge: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 2,
  },
  subActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  subLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
    marginBottom: 4,
  },
  subDesc: {
    fontFamily: 'System',
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 16,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 24,
    color: COLORS.ACCENT_GOLD,
    lineHeight: 28,
  },
  statLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // Ranking row
  rankRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  rankText: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  rankHighlight: {
    color: COLORS.ACCENT_GOLD,
    fontFamily: FONTS.MONO_BOLD,
  },

  // Section divider
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 20,
    marginHorizontal: 24,
  },

  // Menu
  menuSection: {
    paddingHorizontal: 24,
  },
  menuSectionTitle: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 3,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemIcon: {
    fontSize: 18,
    color: COLORS.ACCENT_GOLD,
    width: 24,
    textAlign: 'center',
  },
  menuItemLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1.5,
  },
  menuChevron: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.3)',
    lineHeight: 26,
  },

  // Upgrade CTA
  upgradeCta: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(232,197,111,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(232,197,111,0.15)',
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradeTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 2,
    marginBottom: 12,
  },
  upgradeBody: {
    fontFamily: 'System',
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  upgradeBtn: {
    width: '100%',
  },

  // App info
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  appInfoText: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: 'rgba(255,255,255,0.18)',
    letterSpacing: 1.5,
  },
});
