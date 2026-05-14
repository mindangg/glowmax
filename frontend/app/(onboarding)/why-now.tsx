import React, {useEffect, useRef, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withTiming,} from 'react-native-reanimated';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import {COLORS, FONTS} from '../../lib/constants';

const face = require('../../assets/images/face.png');
const body = require('../../assets/images/body.png');
const back = require('../../assets/images/back.png');


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

const HEADING_PREFIX = 'BẠN CẦN BẮT ĐẦU\n';
const HEADING_UNDERLINE = 'NGAY BÂY GIỜ.';
const HEADING_FULL = HEADING_PREFIX + HEADING_UNDERLINE;

export default function WhyNowScreen() {
  const router = useRouter();

  const { displays, stepDone } = useTypingSequence([
    { text: HEADING_FULL, speed: 55, pauseAfter: 300 },
  ], 400);

  const section1Opacity = useSharedValue(0);
  const section2Opacity = useSharedValue(0);
  const section3Opacity = useSharedValue(0);
  const boxOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    if (stepDone[0]) {
      section1Opacity.value = withDelay(500, withTiming(1, { duration: 620 }));
      section2Opacity.value = withDelay(1200, withTiming(1, { duration: 620 }));
      section3Opacity.value = withDelay(1900, withTiming(1, { duration: 620 }));
      boxOpacity.value = withDelay(2600, withTiming(1, { duration: 620 }));
      ctaOpacity.value = withDelay(3300, withTiming(1, { duration: 620 }));
    }
  }, [stepDone[0]]);

  const section1Style = useAnimatedStyle(() => ({ opacity: section1Opacity.value }));
  const section2Style = useAnimatedStyle(() => ({ opacity: section2Opacity.value }));
  const section3Style = useAnimatedStyle(() => ({ opacity: section3Opacity.value }));
  const boxStyle = useAnimatedStyle(() => ({ opacity: boxOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const renderHeading = () => {
    const typed = displays[0];
    if (stepDone[0]) {
      return (
        <Text style={styles.heading}>
          {HEADING_PREFIX}
          <Text>{HEADING_UNDERLINE}</Text>
        </Text>
      );
    }
    if (typed.startsWith(HEADING_PREFIX)) {
      return (
        <Text style={styles.heading}>
          {HEADING_PREFIX}
          <Text>{typed.slice(HEADING_PREFIX.length)}</Text>
        </Text>
      );
    }
    return <Text style={styles.heading}>{typed}</Text>;
  };

  return (
    <TrailBackground>
      <View style={styles.outer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeading()}

          {/* Section 1: PHÁT TRIỂN XƯƠNG MẶT */}
          <Animated.View style={[styles.section, section1Style]}>
            <View style={styles.sectionRowEnd}>
              <Text style={[styles.sectionTitle, { flex: 1, marginTop: 20 }]}>PHÁT TRIỂN XƯƠNG MẶT</Text>
              <View style={styles.placeholderSquare}>
                <Image
                    style={{
                      width: 150,
                      height: 120,
                      backgroundColor: 'transparent',
                      position: 'absolute',
                      top: -55,
                      left: -90,
                    }}
                    source={face}
                    resizeMode="contain"
                />
              </View>
            </View>
            <Text style={[styles.sectionBody, { marginTop: -15 }]}>
              TĂNG TRƯỞNG XƯƠNG PHÍA TRƯỚC & CÁC HALO KHUÔN MẶT KHÁC QUA CHẾ ĐỘ ĂN UỐNG, TẬP LUYỆN VÀ NGỦ TỐI ƯU
            </Text>
          </Animated.View>

          {/* Section 2: TỐI ĐA HÓA CHIỀU CAO */}
          <Animated.View style={[styles.section, section2Style]}>
            <View style={styles.sectionRowStart}>
              {/* TODO: replace with body figure image */}
              <View style={styles.placeholderTall}>
                <Image
                    style={{
                      width: 150,
                      height: 120,
                      backgroundColor: 'transparent',
                    }}
                    source={body}
                    resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.sectionTitle}>TỐI ĐA HÓA CHIỀU CAO</Text>
                <Text style={styles.sectionBody}>
                  TỐI ĐA HÓA TIỀM NĂNG CHIỀU CAO DI TRUYỀN KHI TẤM TĂNG TRƯỞNG CỦA BẠN VẪN CÒN MỞ
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Section 3: ĐIỂM CHUYỂN HÓA & V-TAPER */}
          <Animated.View style={[styles.section, section3Style]}>
            <View style={styles.sectionRowEnd}>
              <Text style={[styles.sectionTitle, styles.sectionTitleLarge, { flex: 1 }]}>
                {'ĐIỂM CHUYỂN HÓA CƠ BẢN\n& TIỀM NĂNG V-TAPER'}
              </Text>
              {/* TODO: replace with muscular back image */}
              <View style={styles.placeholderSquare}>
                <Image
                    style={{
                      width: 136,
                      height: 105,
                      backgroundColor: 'transparent',
                      marginRight: 40,
                      marginBottom: 20,
                    }}
                    source={back}
                    resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.sectionBody}>
              KHẢ NĂNG DUY TRÌ MỠ THẤP & TIỀM NĂNG V-TAPER CỦA CƠ THỂ (TRƯỚC KHI TẤM TĂNG TRƯỞNG XƯƠNG ĐÒN LIỀN) ĐƯỢC ĐẶT CỐ ĐỊNH VÀO TUỔI 25.
            </Text>
          </Animated.View>

          {/* Highlighted box */}
          <Animated.View style={[styles.highlightBox, boxStyle]}>
            <Text style={styles.highlightText}>
              {'THÓI QUEN & NỖ LỰC HÔM NAY\nSẼ QUYẾT ĐỊNH MỨC PSL TỐI ĐA\nBẠN ĐẠT ĐƯỢC '}
              <Text style={styles.highlightRed}>MÃI MÃI.</Text>
            </Text>
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
          <FrostedButton
            label="KHÔNG QUAN TRỌNG ĐẾN VẬY?"
            onPress={() => router.push('/(onboarding)/deep-truth')}
          />
        </Animated.View>
      </View>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 90,
  },
  heading: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 32,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
    lineHeight: 44,
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
  },
  sectionTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 23,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionTitleLarge: {
    fontSize: 20,
    lineHeight: 28,
  },
  sectionBody: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  placeholderSquare: {
    width: 64,
    height: 64,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  placeholderTall: {
    width: 44,
    height: 80,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  highlightBox: {
    borderWidth: 1,
    borderColor: 'rgba(200,50,50,0.6)',
    borderRadius: 12,
    padding: 20,
  },
  highlightText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 22,
  },
  highlightRed: {
    color: '#E03030',
    textDecorationLine: 'underline',
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});
