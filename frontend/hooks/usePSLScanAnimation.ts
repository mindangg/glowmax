import { useState, useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { SCAN_METRICS } from '../lib/metrics';
import { FaceCoords } from '../lib/faceCoords';

const SCREEN_H = Dimensions.get('window').height;
const METRIC_DURATION = 1200; // 1.2s per metric — 20 × 1.2 = 24s total
const SCAN_LINE_DURATION = 2500; // full face-region sweep
const TOTAL_DURATION = METRIC_DURATION * SCAN_METRICS.length; // 24s

export function usePSLScanAnimation(faceCoords: FaceCoords) {
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const faceCoordsRef = useRef(faceCoords);
  faceCoordsRef.current = faceCoords;

  // --- Shared values (UI thread) ---
  // Scan line: sweeps foreheadY→neckY repeatedly (absolute pixels)
  const scanLineY = useSharedValue(faceCoords.foreheadY);
  // Gold reference line: jumps per metric (0-1 fraction of screen height)
  const goldLineY = useSharedValue(faceCoords[SCAN_METRICS[0].faceYKey] / SCREEN_H);
  // Progress bar: 0→1
  const progress = useSharedValue(0);

  // Restart scan line whenever faceCoords updates (fallback → real coords)
  useEffect(() => {
    scanLineY.value = faceCoords.foreheadY;
    scanLineY.value = withRepeat(
      withTiming(faceCoords.neckY, {
        duration: SCAN_LINE_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [faceCoords]);

  // Start metric timer chain + progress bar on mount
  useEffect(() => {
    progress.value = withTiming(1, {
      duration: TOTAL_DURATION,
      easing: Easing.linear,
    });

    const advance = () => {
      indexRef.current += 1;

      if (indexRef.current >= SCAN_METRICS.length) {
        scanLineY.value = withTiming(scanLineY.value, { duration: 0 });
        setIsComplete(true);
        return;
      }

      const metric = SCAN_METRICS[indexRef.current];
      setCurrentMetricIndex(indexRef.current);

      // Gold reference line jumps to the metric's corresponding face Y coordinate
      const F = faceCoordsRef.current;
      goldLineY.value = withTiming(F[metric.faceYKey] / SCREEN_H, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });

      timerRef.current = setTimeout(advance, METRIC_DURATION);
    };

    timerRef.current = setTimeout(advance, METRIC_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
