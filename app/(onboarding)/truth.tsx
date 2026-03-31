import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import GrainBackground from '../../components/backgrounds/GrainBackground';
import MorseCodeDivider from '../../components/ui/MorseCodeDivider';
import FrostedButton from '../../components/ui/FrostedButton';
import { COLORS, FONTS } from '../../lib/constants';

const blackPill = require('../../assets/images/black-pill.jpg');

function useTypingSequence(steps: { text: string; speed?: number; pauseAfter?: number }[], initialDelay = 800) {
  const [displays, setDisplays] = useState<string[]>(steps.map(() => ''));
  const [stepDone, setStepDone] = useState<boolean[]>(steps.map(() => false));
  const stepDoneRef = useRef<boolean[]>(steps.map(() => false));

  useEffect(() => {
    let cancelled = false;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= steps.length || cancelled) return;
      const { text, speed = 65, pauseAfter = 400 } = steps[stepIndex];
      let i = 0;

      const interval = setInterval(() => {
        if (cancelled) { clearInterval(interval); return; }
        i++;
        setDisplays(prev => {
          const next = [...prev];
          next[stepIndex] = text.slice(0, i);
          return next;
        });
        if (i >= text.length) {
          clearInterval(interval);
          stepDoneRef.current[stepIndex] = true;
          setStepDone([...stepDoneRef.current]);
          setTimeout(() => runStep(stepIndex + 1), pauseAfter);
        }
      }, speed);
    };

    const timeout = setTimeout(() => runStep(0), initialDelay);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return { displays, stepDone };
}

export default function TruthScreen() {
  const router = useRouter();

  const pillOpacity = useSharedValue(0);
  const pillTranslateY = useSharedValue(-20);
  const dividerOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  const { displays, stepDone } = useTypingSequence([
    { text: 'BẠN ĐÃ TÌM RA\nSỰ THẬT', speed: 60 },
    { text: 'KHÁM PHÁ BP & LOOKSMAXXING ở độ tuổi của bạn giúp bạn có LỢI THẾ CỰC LỚN.', speed: 45, pauseAfter: 2000 },
    { text: 'BẠN LÀ NGƯỜI KHÁC BIỆT.\nRẤT ÍT NGƯỜI Ở VỊ TRÍ CỦA BẠN.', speed: 50 },
  ], 800);

  // Trigger divider và CTA dựa theo stepDone
  useEffect(() => {
    if (stepDone[1]) {
      dividerOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
    }
  }, [stepDone[1]]);

  useEffect(() => {
    if (stepDone[2]) {
      ctaOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    }
  }, [stepDone[2]]);

  useEffect(() => {
    pillOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    pillTranslateY.value = withDelay(200, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
  }, []);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ translateY: pillTranslateY.value }],
  }));
  const dividerStyle = useAnimatedStyle(() => ({ opacity: dividerOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
      <GrainBackground>
        <View style={styles.container}>
          <Animated.View style={[styles.pillWrapper, pillStyle]}>
            <Image
                style={{ width: 150, height: 120, transform: [{ rotate: '-10deg' }] }}
                source={blackPill}
            />
          </Animated.View>

          <Text style={styles.title}>{displays[0]}</Text>

          <View style={styles.bodyWrapper}>
            <Text style={styles.body}>{displays[1]}</Text>
          </View>

          <Animated.View style={dividerStyle}>
            <MorseCodeDivider />
          </Animated.View>

          <View style={styles.bottomTextWrapper}>
            <Text style={styles.bottom}>{displays[2]}</Text>
          </View>

          <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
            <FrostedButton
                label="VẬY TIẾP THEO LÀ GÌ"
                onPress={() => router.push('/(onboarding)/height-weight')}
            />
          </Animated.View>
        </View>
      </GrainBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 180,
  },
  pillWrapper: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 32,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 1,
  },
  body: {
    fontFamily: FONTS.MONO,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  bodyWrapper: {
    paddingHorizontal: 60,
    marginBottom: 8,
  },
  bottomTextWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  bottom: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});