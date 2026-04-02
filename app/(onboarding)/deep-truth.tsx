import React, { useEffect, useState, useRef } from 'react';
import {View, Text, StyleSheet, ScrollView, Image} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import GrainBackground from '../../components/backgrounds/GrainBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import { COLORS, FONTS } from '../../lib/constants';

const watch = require('../../assets/images/rolex.png');
const lips = require('../../assets/images/lips.png');

function useTypingSequence(
  steps: { text: string; speed?: number; pauseAfter?: number }[],
  initialDelay = 800
) {
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

const HEADING_PART1 = 'NÓ ';
const HEADING_UNDERLINE = 'THẬT SỰ';
const HEADING_PART2 = '\nQUAN TRỌNG.';
const HEADING_FULL = HEADING_PART1 + HEADING_UNDERLINE + HEADING_PART2;

export default function DeepTruthScreen() {
  const router = useRouter();

  const { displays, stepDone } = useTypingSequence([
    { text: HEADING_FULL, speed: 55, pauseAfter: 300 },
  ], 400);

  const subtitleOpacity = useSharedValue(0);
  const section1Opacity = useSharedValue(0);
  const section2Opacity = useSharedValue(0);
  const section3Opacity = useSharedValue(0);
  const refsOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    if (stepDone[0]) {
      subtitleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
      section1Opacity.value = withDelay(1100, withTiming(1, { duration: 620 }));
      section2Opacity.value = withDelay(2000, withTiming(1, { duration: 620 }));
      section3Opacity.value = withDelay(2700, withTiming(1, { duration: 620 }));
      refsOpacity.value = withDelay(3400, withTiming(1, { duration: 620 }));
      ctaOpacity.value = withDelay(3900, withTiming(1, { duration: 600 }));
    }
  }, [stepDone[0]]);

  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const section1Style = useAnimatedStyle(() => ({ opacity: section1Opacity.value }));
  const section2Style = useAnimatedStyle(() => ({ opacity: section2Opacity.value }));
  const section3Style = useAnimatedStyle(() => ({ opacity: section3Opacity.value }));
  const refsStyle = useAnimatedStyle(() => ({ opacity: refsOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const renderHeading = () => {
    const typed = displays[0];
    const p1End = HEADING_PART1 + HEADING_UNDERLINE;
    if (typed.startsWith(p1End)) {
      return (
        <Text style={styles.heading}>
          {HEADING_PART1}
          <Text>{HEADING_UNDERLINE}</Text>
          {typed.slice(p1End.length)}
        </Text>
      );
    }
    if (typed.startsWith(HEADING_PART1)) {
      return (
        <Text style={styles.heading}>
          {HEADING_PART1}
          <Text>{typed.slice(HEADING_PART1.length)}</Text>
        </Text>
      );
    }
    return <Text style={styles.heading}>{typed}</Text>;
  };

  return (
    <GrainBackground>
      <View style={styles.outer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeading()}

          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            ĐỪNG TỰ DỐI LÒNG NỮA...
          </Animated.Text>

          {/* Section 1: THU NHẬP SỰ NGHIỆP */}
          <Animated.View style={[styles.section, section1Style]}>
            <View style={styles.sectionRowEnd}>
              <Text style={[styles.sectionTitle, styles.sectionTitleGreen]}>
                {'THU NHẬP\nSỰ NGHIỆP'}
              </Text>
              <View style={styles.placeholderWatch}>
                <Image
                    style={{
                      width: 150,
                      height: 120,
                      backgroundColor: 'transparent',
                    }}
                    source={watch}
                    resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.sectionBody}>
              TRUNG BÌNH MỌI NGƯỜI KIẾM THÊM{' '}
              <Text style={styles.sectionBodyBold}>$500 NHIỀU HƠN</Text>
              {' '}CHO MỖI INCH CAO HƠN 6FT.
            </Text>
          </Animated.View>

          {/* Section 2: HẸN HÒ & HYPERGAMY */}
          <Animated.View style={[styles.section, section2Style]}>
            <View style={styles.sectionRowStart}>
              <View style={styles.placeholderLips}>
                <Image
                    style={{
                      width: 150,
                      height: 120,
                      backgroundColor: 'transparent',
                    }}
                    source={lips}
                    resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={[styles.sectionTitle, { textAlign: 'right' }]}>
                  {'HẸN HÒ &\nHYPERGAMY'}
                </Text>
              </View>
            </View>
            <Text style={[styles.sectionBody, { textAlign: 'right' }]}>
              <Text style={styles.sectionBodyBold}>CHỈ 4.5% ĐÀN ÔNG</Text>
              {' '}ĐƯỢC QUẸT PHẢI TRÊN TINDER SO VỚI 60% PHỤ NỮ...
            </Text>
          </Animated.View>

          {/* Section 3: SỰ TỰ TIN */}
          <Animated.View style={[styles.section, section3Style]}>
            <Text style={styles.sectionTitle}>SỰ TỰ TIN</Text>
            <Text style={styles.sectionBody}>
              MỌI NGƯỜI NÓI{' '}
              <Text style={styles.sectionBodyStrike}>"HÃY TỰ TIN LÊN"</Text>
              {' '}NHƯNG KHOA HỌC NÓI{' '}
              <Text style={styles.sectionBodyBold}>NGOẠI HÌNH & LÒNG TỰ TRỌNG CÓ MỐI LIÊN HỆ CHẶT CHẼ</Text>
            </Text>
          </Animated.View>

          {/* References */}
          <Animated.Text style={[styles.references, refsStyle]}>
            (Tham khảo: Odeh 2022, Holik et al. 2022, Daniati et al. 2013)
          </Animated.Text>

          <View style={{ height: 120 }} />
        </ScrollView>

        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="BẮT ĐẦU HÀNH ĐỘNG"
            onPress={() => router.push('/(onboarding)/height-weight')}
          />
        </Animated.View>
      </View>
    </GrainBackground>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  heading: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 32,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionRowEnd: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionRowStart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  sectionTitleGreen: {
    color: '#7EC87E',
  },
  sectionBody: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  sectionBodyBold: {
    fontFamily: FONTS.MONO_BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  sectionBodyStrike: {
    fontFamily: FONTS.MONO,
    color: COLORS.TEXT_SECONDARY,
    textDecorationLine: 'line-through',
  },
  placeholderWatch: {
    width: 60,
    height: 72,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  placeholderLips: {
    width: 64,
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholderLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  references: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'left',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
