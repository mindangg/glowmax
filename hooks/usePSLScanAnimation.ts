import { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { SCAN_METRICS } from '../lib/metrics';

const SCREEN_H = Dimensions.get('window').height;
const METRIC_DURATION = 1200; // 1.2s per metric — 20 × 1.2 = 24s total
const SCAN_LINE_DURATION = 2500; // full top-to-bottom sweep

export function usePSLScanAnimation() {
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Shared values (UI thread) ---
  // Continuous scan line: sweeps top→bottom repeatedly (absolute pixels)
  const scanLineY = useSharedValue(0);
  // Gold reference line: jumps per metric group (0-1 fraction)
  const goldLineY = useSharedValue(SCAN_METRICS[0].goldLineYPercent / 100);
  // Progress bar: 0→1
  const progress = useSharedValue(0);

  const startAnimation = useCallback(() => {
    // Continuous scan line — repeats top→bottom infinitely
    scanLineY.value = 0;
    scanLineY.value = withRepeat(
      withTiming(SCREEN_H, {
        duration: SCAN_LINE_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // First metric progress
    progress.value = withTiming(1 / SCAN_METRICS.length, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    const advance = () => {
      indexRef.current += 1;

      if (indexRef.current >= SCAN_METRICS.length) {
        progress.value = withTiming(1, { duration: 300 });
        // Stop scan line at current position
        scanLineY.value = withTiming(scanLineY.value, { duration: 0 });
        setIsComplete(true);
        return;
      }

      const metric = SCAN_METRICS[indexRef.current];
      setCurrentMetricIndex(indexRef.current);

      // Gold reference line jumps to metric's Y position
      goldLineY.value = withTiming(metric.goldLineYPercent / 100, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });

      // Progress advances
      progress.value = withTiming(indexRef.current / SCAN_METRICS.length, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      });

      timerRef.current = setTimeout(advance, METRIC_DURATION);
    };

    timerRef.current = setTimeout(advance, METRIC_DURATION);
  }, []);

  useEffect(() => {
    startAnimation();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startAnimation]);

  const currentMetric = SCAN_METRICS[currentMetricIndex];

  return {
    currentMetric,
    currentMetricIndex,
    progress,
    scanLineY,
    goldLineY,
    isComplete,
  };
}
