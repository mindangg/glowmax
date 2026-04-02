import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import ChromaticGlassBackground from '../../components/backgrounds/ChromaticGlassBackground';
import BackArrow from '../../components/ui/BackArrow';
import { useSubscription } from '../../hooks/useSubscription';
import { COLORS, FONTS } from '../../lib/constants';

export default function PaywallScreen() {
  const router = useRouter();
  const { purchaseWeekly, purchaseYearly, restorePurchases } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  const headerOpacity = useSharedValue(0);
  const plansOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    plansOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const plansStyle = useAnimatedStyle(() => ({ opacity: plansOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const handlePurchase = async () => {
    setLoading(true);
    const result = selectedPlan === 'weekly'
      ? await purchaseWeekly()
      : await purchaseYearly();
    setLoading(false);
    if (result.success) {
      router.replace('/(main)/scan');
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const result = await restorePurchases();
    setLoading(false);
    if (result.restored) {
      router.replace('/(main)/scan');
    }
  };

  return (
    <ChromaticGlassBackground>
      <BackArrow />
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Text style={styles.title}>MỞ KHÓA{'\n'}TOÀN BỘ KẾT QUẢ</Text>
          <Text style={styles.subtitle}>
            PHÂN TÍCH KHUÔN MẶT ĐẦY ĐỦ — 9 DANH MỤC CHI TIẾT
          </Text>
        </Animated.View>

        {/* Features list */}
        <Animated.View style={[styles.features, headerStyle]}>
          {[
            'PHÂN TÍCH 12+ CHỈ SỐ KHUÔN MẶT',
            'ASCENSION PLAN CÁ NHÂN HÓA',
            'LEANMAX PROTOCOL',
            'QUÉT KHÔNG GIỚI HẠN',
          ].map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Plans */}
        <Animated.View style={[styles.plans, plansStyle]}>
          {/* Yearly */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.8}
          >
            <View style={styles.bestValue}>
              <Text style={styles.bestValueText}>GIÁ TỐT NHẤT</Text>
            </View>
            <Text style={[styles.planName, selectedPlan === 'yearly' && styles.planNameSelected]}>
              GÓI NĂM
            </Text>
            <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceSelected]}>
              TIẾT KIỆM 80%
            </Text>
            <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioSelected]}>
              {selectedPlan === 'yearly' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {/* Weekly */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'weekly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('weekly')}
            activeOpacity={0.8}
          >
            <Text style={[styles.planName, selectedPlan === 'weekly' && styles.planNameSelected]}>
              GÓI TUẦN
            </Text>
            <Text style={[styles.planPrice, selectedPlan === 'weekly' && styles.planPriceSelected]}>
              THỬ LINH HOẠT
            </Text>
            <View style={[styles.radio, selectedPlan === 'weekly' && styles.radioSelected]}>
              {selectedPlan === 'weekly' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={loading}
            activeOpacity={0.8}
            style={styles.purchaseBtn}
          >
            <LinearGradient
              colors={[COLORS.BUTTON_GRADIENT_START, COLORS.BUTTON_GRADIENT_END]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseGradient}
            >
              {loading ? (
                <ActivityIndicator color="#1A1A1A" />
              ) : (
                <Text style={styles.purchaseLabel}>MỞ KHÓA NGAY</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={styles.restoreText}>KHÔI PHỤC GÓI ĐÃ MUA</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ChromaticGlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
    marginTop: 12,
    letterSpacing: 0.5,
  },
  features: {
    marginBottom: 32,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.ACCENT_GOLD,
  },
  featureText: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
  },
  plans: {
    gap: 12,
  },
  planCard: {
    backgroundColor: COLORS.GLASS_FILL,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: COLORS.ACCENT_GOLD,
    backgroundColor: 'rgba(232,197,111,0.08)',
  },
  bestValue: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: COLORS.ACCENT_GOLD,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bestValueText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 9,
    color: '#1A1A1A',
    letterSpacing: 1,
  },
  planName: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    letterSpacing: 1,
  },
  planNameSelected: {
    color: COLORS.ACCENT_GOLD,
  },
  planPrice: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.MUTED_GRAY,
    marginRight: 16,
  },
  planPriceSelected: {
    color: COLORS.TEXT_PRIMARY,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.ACCENT_GOLD,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.ACCENT_GOLD,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
    gap: 16,
    alignItems: 'center',
  },
  purchaseBtn: {
    width: '100%',
  },
  purchaseGradient: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseLabel: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: '#1A1A1A',
    letterSpacing: 2,
  },
  restoreBtn: {
    paddingVertical: 8,
  },
  restoreText: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.MUTED_GRAY,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
