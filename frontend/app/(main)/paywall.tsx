import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import BackArrow from '../../components/ui/BackArrow';
import { Svg, Path } from 'react-native-svg';
import FrostedButton from '../../components/ui/FrostedButton';
import { useSubscription } from '../../hooks/useSubscription';
import { useOnboarding } from '../../hooks/useOnboarding';
import {
  signInWithProvider,
  upsertProfile,
  checkUsernameAvailable,
  getCurrentProfile,
} from '../../lib/auth';
import { COLORS, FONTS } from '../../lib/constants';

// ── Helpers (re-use from username screen) ─────────────────────────────────────

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;

function sanitise(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z0-9 ._\-àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹý]/g, '');
}

// ── Step type ─────────────────────────────────────────────────────────────────

type Step = 'auth' | 'conflict' | 'purchase';

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaywallScreen() {
  const router = useRouter();
  const { purchaseWeekly, purchaseYearly, restorePurchases } = useSubscription();
  const { answers } = useOnboarding();

  const [step, setStep]               = useState<Step>('auth');
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'yearly'>('yearly');
  const [loading, setLoading]         = useState(false);
  const [initChecking, setInitChecking] = useState(true);

  // Conflict-resolution state
  const [conflictUsername, setConflictUsername] = useState('');
  const [conflictChecking, setConflictChecking] = useState(false);
  const [conflictError, setConflictError]       = useState('');

  const headerOpacity = useSharedValue(0);
  const plansOpacity  = useSharedValue(0);
  const ctaOpacity    = useSharedValue(0);

  const animate = useCallback(() => {
    headerOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    plansOpacity.value  = withDelay(500, withTiming(1, { duration: 500 }));
    ctaOpacity.value    = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  useEffect(() => { animate(); }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const plansStyle  = useAnimatedStyle(() => ({ opacity: plansOpacity.value }));
  const ctaStyle    = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  // ── On mount: skip auth step if already signed in with real account ──────────
  useEffect(() => {
    (async () => {
      const profile = await getCurrentProfile();
      if (profile && !profile.is_anonymous) {
        setStep('purchase');
      }
      setInitChecking(false);
    })();
  }, []);

  // ── Auth step handlers ────────────────────────────────────────────────────────

  const handleSignIn = async (provider: 'apple' | 'google') => {
    setLoading(true);
    const result = await signInWithProvider(provider);
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Đăng nhập thất bại', result.error);
      return;
    }

    // After sign in, ensure there's a profile with a valid username.
    await resolveProfile(result.linked);
  };

  /**
   * After OAuth:
   * - linked=true  → user_id unchanged, profile might already exist (from scan).
   *   If no profile yet, create one from onboarding username.
   * - linked=false → user_id switched to existing account. That account may
   *   already have a profile. If not, create one from onboarding username.
   *   If the onboarding username is taken, show conflict UI.
   */
  const resolveProfile = async (linked: boolean) => {
    setLoading(true);

    // Check for an existing profile on the (possibly new) account.
    const existing = await getCurrentProfile();
    if (existing) {
      // Already has a profile — go straight to purchase.
      setLoading(false);
      setStep('purchase');
      return;
    }

    // No profile yet — try to claim the username from onboarding.
    const onboardingName = answers.username ? sanitise(String(answers.username)) : '';
    if (onboardingName.length >= USERNAME_MIN) {
      const profileResult = await upsertProfile(onboardingName);
      setLoading(false);
      if (profileResult.ok) {
        setStep('purchase');
        return;
      }
      // Username taken by someone else → show conflict resolution.
      setConflictUsername(onboardingName);
      setConflictError(profileResult.error ?? '');
      setStep('conflict');
      return;
    }

    // No valid onboarding username → show conflict UI to enter one.
    setLoading(false);
    setStep('conflict');
  };

  // ── Conflict resolution ───────────────────────────────────────────────────────

  const handleConflictConfirm = async () => {
    const value = sanitise(conflictUsername);
    if (value.length < USERNAME_MIN) {
      setConflictError(`Tên phải có ít nhất ${USERNAME_MIN} ký tự.`);
      return;
    }
    if (value.length > USERNAME_MAX) {
      setConflictError(`Tên không được vượt quá ${USERNAME_MAX} ký tự.`);
      return;
    }

    setConflictChecking(true);
    const available = await checkUsernameAvailable(value);
    if (!available) {
      setConflictChecking(false);
      setConflictError('Tên này đã được sử dụng. Vui lòng chọn tên khác.');
      return;
    }

    const result = await upsertProfile(value);
    setConflictChecking(false);
    if (!result.ok) {
      setConflictError(result.error ?? 'Đã xảy ra lỗi.');
      return;
    }

    setStep('purchase');
  };

  // ── Purchase handlers ─────────────────────────────────────────────────────────

  const handlePurchase = async () => {
    setLoading(true);
    const result = selectedPlan === 'weekly'
      ? await purchaseWeekly()
      : await purchaseYearly();
    setLoading(false);
    if (result.success) {
      router.replace('/(premium)/scan');
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const result = await restorePurchases();
    setLoading(false);
    if (result.restored) {
      router.replace('/(premium)/scan');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  if (initChecking) {
    return (
      <TrailBackground>
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.ACCENT_GOLD} />
        </View>
      </TrailBackground>
    );
  }

  return (
    <TrailBackground>
      <BackArrow />
      <View style={styles.container}>

        {/* ── STEP: AUTH ─────────────────────────────────────────────────────── */}
        {step === 'auth' && (
          <>
            <Animated.View style={[styles.header, headerStyle]}>
              <Text style={styles.title}>TẠO TÀI KHOẢN{'\n'}ĐỂ MỞ KHÓA</Text>
              <Text style={styles.subtitle}>
                ĐĂNG NHẬP ĐỂ MUA GÓI VÀ ĐỒNG BỘ DỮ LIỆU CỦA BẠN
              </Text>
            </Animated.View>

            <Animated.View style={[styles.authButtons, ctaStyle]}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSignIn('apple')}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.appleIcon}></Text>
                <Text style={styles.socialLabel}>Đăng nhập với Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSignIn('google')}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </Svg>
                <Text style={styles.socialLabel}>Đăng nhập với Google</Text>
              </TouchableOpacity>

              {loading && (
                <ActivityIndicator color={COLORS.ACCENT_GOLD} style={{ marginTop: 16 }} />
              )}
            </Animated.View>
          </>
        )}

        {/* ── STEP: CONFLICT ─────────────────────────────────────────────────── */}
        {step === 'conflict' && (
          <>
            <Animated.View style={[styles.header, headerStyle]}>
              <Text style={styles.title}>CHỌN TÊN{'\n'}NGƯỜI DÙNG</Text>
              <Text style={styles.subtitle}>
                TÊN BẠN ĐÃ CHỌN TRƯỚC ĐÓ ĐÃ ĐƯỢC SỬ DỤNG.{'\n'}VUI LÒNG CHỌN TÊN MỚI.
              </Text>
            </Animated.View>

            <Animated.View style={[styles.inputWrapper, plansStyle]}>
              <TextInput
                style={[styles.conflictInput, conflictError ? styles.conflictInputError : null]}
                value={conflictUsername}
                onChangeText={(t) => { setConflictUsername(t); setConflictError(''); }}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={USERNAME_MAX + 5}
                placeholder="tên mới của bạn"
                placeholderTextColor="rgba(255,255,255,0.2)"
                selectionColor={COLORS.ACCENT_GOLD}
                autoFocus
              />
              {conflictError ? (
                <Text style={styles.conflictErrorText}>{conflictError}</Text>
              ) : null}
            </Animated.View>

            <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
              <FrostedButton
                label={conflictChecking ? 'ĐANG KIỂM TRA…' : 'XÁC NHẬN'}
                onPress={handleConflictConfirm}
                disabled={conflictChecking || sanitise(conflictUsername).length < USERNAME_MIN}
              />
            </Animated.View>
          </>
        )}

        {/* ── STEP: PURCHASE ─────────────────────────────────────────────────── */}
        {step === 'purchase' && (
          <>
            <Animated.View style={[styles.header, headerStyle]}>
              <Text style={styles.title}>MỞ KHÓA{'\n'}TOÀN BỘ KẾT QUẢ</Text>
              <Text style={styles.subtitle}>
                PHÂN TÍCH KHUÔN MẶT ĐẦY ĐỦ — 9 DANH MỤC CHI TIẾT
              </Text>
            </Animated.View>

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
          </>
        )}

      </View>
    </TrailBackground>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    lineHeight: 18,
  },

  // Auth step
  authButtons: {
    marginTop: 16,
    gap: 14,
    alignItems: 'center',
  },
  socialBtn: {
    width: '100%',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  appleIcon: {
    fontSize: 18,
    color: '#000000',
    lineHeight: 22,
    marginTop: -2,
  },
  socialLabel: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 15,
    color: '#000000',
    letterSpacing: 0,
  },

  // Conflict step
  inputWrapper: {
    marginTop: 8,
    alignItems: 'center',
  },
  conflictInput: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ACCENT_GOLD,
    paddingBottom: 8,
    width: '90%',
  },
  conflictInputError: {
    borderBottomColor: '#ff4d4d',
  },
  conflictErrorText: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: '#ff4d4d',
    marginTop: 10,
    textAlign: 'center',
  },

  // Purchase step
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

  // CTA (shared)
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
