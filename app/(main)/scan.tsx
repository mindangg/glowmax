import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { usePSLScanAnimation } from '../../hooks/usePSLScanAnimation';
import ScanOverlay from '../../components/scan/ScanOverlay';
import MetricCard from '../../components/scan/MetricCard';
import GoldReferenceLine from '../../components/scan/GoldReferenceLine';
import ScanProgressBar from '../../components/scan/ScanProgressBar';
import { COLORS } from '../../lib/constants';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const { photoUri: paramPhotoUri } = useLocalSearchParams<{ photoUri: string }>();
  const [photoUri, setPhotoUri] = useState<string | null>(paramPhotoUri || null);
  const {
    currentMetric,
    currentMetricIndex,
    progress,
    scanLineY,
    goldLineY,
    isComplete,
  } = usePSLScanAnimation();

  // Animated style for the moving scan line (absolute pixel Y)
  const scanLineAnimatedStyle = useAnimatedStyle(() => ({
    top: scanLineY.value,
  }));

  // Find photo if not passed via params
  useEffect(() => {
    if (photoUri) return;

    (async () => {
      try {
        const dir = FileSystem.documentDirectory;
        if (!dir) return;
        const files = await FileSystem.readDirectoryAsync(dir);
        const frontPhotos = files
          .filter((f) => f.startsWith('front_photo_') && f.endsWith('.jpg'))
          .sort()
          .reverse();
        if (frontPhotos.length > 0) {
          setPhotoUri(dir + frontPhotos[0]);
        }
      } catch {
        // silently fail — fallback bg will show
      }
    })();
  }, []);

  // Navigate to results when scan animation completes
  useEffect(() => {
    if (!isComplete) return;

    const timer = setTimeout(() => {
      router.replace({
        pathname: '/(main)/results',
        params: { photoUri: photoUri || '' },
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [isComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background C — user's front-facing photo */}
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.backgroundPhoto}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.backgroundPhoto, styles.fallbackBg]} />
      )}

      {/* Subtle dark overlay for contrast on AR lines */}
      <View style={styles.darkOverlay} />

      {/* Progress bar — top of screen */}
      <ScanProgressBar progress={progress} />

      {/* Continuous scan line — sweeps top to bottom */}
      <Animated.View style={[styles.scanLine, scanLineAnimatedStyle]} />

      {/* Gold reference line — horizontal, moves per metric group */}
      <GoldReferenceLine yPosition={goldLineY} />

      {/* SVG AR overlay lines for current metric */}
      <ScanOverlay
        currentMetric={currentMetric}
        scanLineY={scanLineY}
      />

      {/* Metric card — bottom card cycling through 20 metrics */}
      <MetricCard
        currentMetric={currentMetric}
        metricIndex={currentMetricIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundPhoto: {
    position: 'absolute',
    width: SCREEN_W,
    height: SCREEN_H,
  },
  fallbackBg: {
    backgroundColor: '#0A0C0E',
  },
  darkOverlay: {
    position: 'absolute',
    width: SCREEN_W,
    height: SCREEN_H,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
});
