import { useState, useEffect, useRef } from 'react';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { SCAN_METRICS } from '../lib/metrics';

const METRIC_DURATION = 1500; // 1.5s per metric

export function usePSLScanAnimation() {
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const progress = useSharedValue(0);
  const goldLineY = useSharedValue(SCAN_METRICS[0].goldLineYPercent / 100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const advance = () => {
      indexRef.current += 1;

      if (indexRef.current >= SCAN_METRICS.length) {
        progress.value = withTiming(1, { duration: 300 });
        setIsComplete(true);
        return;
      }

      const metric = SCAN_METRICS[indexRef.current];
      setCurrentMetricIndex(indexRef.current);

      goldLineY.value = withTiming(metric.goldLineYPercent / 100, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });

      progress.value = withTiming(indexRef.current / SCAN_METRICS.length, {
        duration: 500,
      });

      timerRef.current = setTimeout(advance, METRIC_DURATION);
    };

    // Start first metric
    progress.value = withTiming(1 / SCAN_METRICS.length, { duration: 500 });
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
    goldLineY,
    isComplete,
  };
}
