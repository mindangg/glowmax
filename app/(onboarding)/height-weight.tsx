import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import ChromaticGlassBackground from '../../components/backgrounds/ChromaticGlassBackground';
import BackArrow from '../../components/ui/BackArrow';
import ScrollPicker from '../../components/ui/ScrollPicker';
import FrostedButton from '../../components/ui/FrostedButton';
import { useOnboarding } from '../../hooks/useOnboarding';
import { COLORS, FONTS } from '../../lib/constants';

const CM_VALUES = Array.from({ length: 81 }, (_, i) => 140 + i); // 140-220
const KG_VALUES = Array.from({ length: 121 }, (_, i) => 30 + i); // 30-150

export default function HeightWeightScreen() {
  const router = useRouter();
  const { answers, setAnswer } = useOnboarding();
  const [heightCm, setHeightCm] = useState(answers.heightCm || 170);
  const [weightKg, setWeightKg] = useState(answers.weightKg || 65);

  const titleOpacity = useSharedValue(0);
  const pickersOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    pickersOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const pickersStyle = useAnimatedStyle(() => ({ opacity: pickersOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const handleContinue = () => {
    setAnswer('heightCm', heightCm);
    setAnswer('weightKg', weightKg);
    router.push('/(onboarding)/photo-tip');
  };

  return (
    <ChromaticGlassBackground>
      <BackArrow />
      <View style={styles.container}>
        <Animated.Text style={[styles.title, titleStyle]}>
          CHIỀU CAO VÀ{'\n'}CÂN NẶNG CỦA BẠN?
        </Animated.Text>

        <Animated.View style={[styles.pickers, pickersStyle]}>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>CHIỀU CAO</Text>
            <ScrollPicker
              values={CM_VALUES}
              selectedValue={heightCm}
              onValueChange={setHeightCm}
              unit="CM"
            />
          </View>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>CÂN NẶNG</Text>
            <ScrollPicker
              values={KG_VALUES}
              selectedValue={weightKg}
              onValueChange={setWeightKg}
              unit="KG"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton label="TIẾP TỤC" onPress={handleContinue} />
        </Animated.View>
      </View>
    </ChromaticGlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 22,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  pickers: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 32,
    gap: 16,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.MUTED_GRAY,
    letterSpacing: 2,
    marginBottom: 12,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
