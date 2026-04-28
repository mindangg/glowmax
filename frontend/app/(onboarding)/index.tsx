import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {useRouter} from 'expo-router';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming,} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import {COLORS, FONTS} from '../../lib/constants';
import {signInWithProvider} from '../../lib/auth';

const logo = require('../../assets/images/logo.png');

const { height: SH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (provider: 'apple' | 'google') => {
    setLoading(true);
    const result = await signInWithProvider(provider);
    setLoading(false);
    if (!result.ok) {
      Alert.alert('Đăng nhập thất bại', result.error);
      return;
    }
    setShowLoginModal(false);
    router.replace('/(main)/');
  };

  const spiralOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const linkOpacity = useSharedValue(0);

  useEffect(() => {
    spiralOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }));
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    linkOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));
  }, []);

  const spiralStyle = useAnimatedStyle(() => ({ opacity: spiralOpacity.value }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));
  const linkStyle = useAnimatedStyle(() => ({ opacity: linkOpacity.value }));

  return (
    <TrailBackground>
      <View style={styles.container}>

        {/* Top: logo + title + subtitle */}
        <View style={styles.topBlock}>
          <Animated.View style={[styles.spiralContainer, spiralStyle]}>
            <Image
                source={logo}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text style={[styles.title, titleStyle]}>
            CHÀO MỪNG!
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            HÀNH TRÌNH GLOWUP CỦA BẠN{'\n'}BẮT ĐẦU TỪ ĐÂY.
          </Animated.Text>
        </View>

        {/* Bottom: CTA + sign in */}
        <View style={styles.bottomBlock}>
          <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
            <FrostedButton label="BẮT ĐẦU NGAY" onPress={() => router.push('/(onboarding)/username')} />
            {/*<FrostedButton label="BẮT ĐẦU NGAY" onPress={() => router.push('/(premium)/daily')} />*/}
            {/*<FrostedButton label="BẮT ĐẦU NGAY" onPress={() => router.push('/(onboarding)/camera')} />*/}
          </Animated.View>

          <Animated.View style={[styles.linkWrapper, linkStyle]} pointerEvents="box-none">
            <TouchableOpacity onPress={() => setShowLoginModal(true)} activeOpacity={0.7} style={styles.loginLink}>
              <Text style={styles.linkText}>
                ĐÃ CÓ TÀI KHOẢN?{' '}
                <Text style={styles.linkUnderline}>ĐĂNG NHẬP</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

      </View>

      {/* Sign-in modal */}
      <Modal
        visible={showLoginModal}
        transparent
        animationType="slide"
        onRequestClose={() => !loading && setShowLoginModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !loading && setShowLoginModal(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>ĐĂNG NHẬP</Text>
            <Text style={styles.modalSubtitle}>CHỌN PHƯƠNG THỨC ĐĂNG NHẬP</Text>

            {/* Apple button */}
            <TouchableOpacity
              style={styles.appleBtn}
              onPress={() => handleSignIn('apple')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  fill="#000"
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </Svg>
              <Text style={styles.appleBtnLabel}>Đăng nhập với Apple</Text>
            </TouchableOpacity>

            {/* Google button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => handleSignIn('google')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84-.84-.62z" fill="#FBBC05" />
                <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </Svg>
              <Text style={styles.googleBtnLabel}>Đăng nhập với Google</Text>
            </TouchableOpacity>

            {loading && (
              <ActivityIndicator color={COLORS.ACCENT_GOLD} style={{ marginTop: 8 }} />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SH * 0.15,
    paddingBottom: 52,
    paddingHorizontal: 24,
  },
  topBlock: {
    alignItems: 'center',
  },
  spiralContainer: {
    marginBottom: 32,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 36,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    letterSpacing: 1,
  },
  bottomBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  ctaWrapper: {
    width: '100%',
  },
  linkWrapper: {},
  loginLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  linkText: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.MUTED_GRAY,
    textAlign: 'center',
    letterSpacing: 1,
  },
  linkUnderline: {
    textDecorationLine: 'underline',
    color: COLORS.MUTED_GRAY,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#111316',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 14,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 20,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
  },
  modalSubtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.MUTED_GRAY,
    letterSpacing: 1,
    marginBottom: 8,
  },
  appleBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  appleBtnLabel: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },
  googleBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#DADCE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleBtnLabel: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '600',
    color: '#3C4043',
    letterSpacing: -0.3,
  },
});
