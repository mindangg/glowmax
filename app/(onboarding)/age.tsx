import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import BackArrow from '../../components/ui/BackArrow';
import FrostedButton from '../../components/ui/FrostedButton';
import { useOnboarding } from '../../hooks/useOnboarding';
import { COLORS, FONTS } from '../../lib/constants';

export default function AgeScreen() {
  const router = useRouter();
  const { answers, setAnswer } = useOnboarding();
  const [ageText, setAgeText] = useState(answers.age ? String(answers.age) : '');

  const titleOpacity = useSharedValue(0);
  const inputOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    inputOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const inputStyle = useAnimatedStyle(() => ({ opacity: inputOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const handleContinue = () => {
    const age = parseInt(ageText, 10);
    if (isNaN(age) || age < 1 || age > 120) {
      Alert.alert('', 'Vui lòng nhập tuổi hợp lệ.');
      return;
    }
    if (age < 13) {
      Alert.alert(
        'Không đủ tuổi',
        'Bạn phải từ 13 tuổi trở lên để sử dụng GLOWMAX.',
      );
      return;
    }
    setAnswer('age', age);
    router.push('/(onboarding)/truth');
  };

  const isValid = (() => {
    const age = parseInt(ageText, 10);
    return !isNaN(age) && age >= 13 && age <= 120;
  })();

  return (
    <TrailBackground>
      <BackArrow />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.container}>
            <Animated.Text style={[styles.title, titleStyle]}>
              BẠN BAO NHIÊU TUỔI?
            </Animated.Text>

            <Animated.View style={[styles.inputWrapper, inputStyle]}>
              <TextInput
                style={styles.input}
                value={ageText}
                onChangeText={setAgeText}
                keyboardType="number-pad"
                maxLength={3}
                placeholder="18"
                placeholderTextColor="rgba(255,255,255,0.2)"
                selectionColor={COLORS.ACCENT_GOLD}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <Text style={styles.unit}>TUỔI</Text>
            </Animated.View>

            <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
              <FrostedButton
                label="TIẾP TỤC"
                onPress={handleContinue}
                disabled={!isValid}
              />
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -120
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 48,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ACCENT_GOLD,
    paddingBottom: 8,
    width: 120,
  },
  unit: {
    fontFamily: FONTS.MONO,
    fontSize: 16,
    color: COLORS.MUTED_GRAY,
    marginTop: 12,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
