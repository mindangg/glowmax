import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import GrainBackground from '../../components/backgrounds/GrainBackground';
import BackArrow from '../../components/ui/BackArrow';
import OptionCard from '../../components/ui/OptionCard';
import FrostedButton from '../../components/ui/FrostedButton';
import { useOnboarding } from '../../hooks/useOnboarding';
import { FONTS, COLORS } from '../../lib/constants';

export default function GenderScreen() {
  const router = useRouter();
  const { answers, setAnswer } = useOnboarding();

  const titleOpacity = useSharedValue(0);
  const optionsOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    optionsOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const optionsStyle = useAnimatedStyle(() => ({ opacity: optionsOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const handleContinue = () => {
    if (!answers.gender) {
      Alert.alert('', 'Vui lòng chọn giới tính của bạn.');
      return;
    }
    router.push('/(onboarding)/age');
  };

  return (
    <GrainBackground>
      <BackArrow />
      <View style={styles.container}>
        <Animated.Text style={[styles.title, titleStyle]}>
          GIỚI TÍNH CỦA BẠN?
        </Animated.Text>

        <Animated.View style={[styles.options, optionsStyle]}>
          <OptionCard
            label="NAM"
            selected={answers.gender === 'male'}
            onPress={() => setAnswer('gender', 'male')}
          />
          <OptionCard
            label="NỮ"
            selected={answers.gender === 'female'}
            onPress={() => setAnswer('gender', 'female')}
          />
        </Animated.View>

        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="TIẾP TỤC"
            onPress={handleContinue}
            disabled={!answers.gender}
          />
        </Animated.View>
      </View>
    </GrainBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -100
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
  },
  options: {
    gap: 0,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
