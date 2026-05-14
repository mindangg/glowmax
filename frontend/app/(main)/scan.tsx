import React, {useEffect, useState} from 'react';
import {Dimensions, Image, StatusBar, StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {useLocalSearchParams, useRouter} from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {usePSLScanAnimation} from '../../hooks/usePSLScanAnimation';
import ScanOverlay from '../../components/scan/ScanOverlay';
import MetricCard from '../../components/scan/MetricCard';
import GoldReferenceLine from '../../components/scan/GoldReferenceLine';
import ScanProgressBar from '../../components/scan/ScanProgressBar';
import {FACE_COORDS_STORAGE_KEY, FaceCoords} from '../../lib/faceCoords';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Fallback coords used only if AsyncStorage read fails (should never happen in
// normal flow — face detection runs before navigating to this screen).
function makeFallback(): FaceCoords {
  return {
    cx:           SCREEN_W * 0.50,
    leX:          SCREEN_W * 0.36,
    reX:          SCREEN_W * 0.64,
    eyeY:         SCREEN_H * 0.38,
    noseBridgeY:  SCREEN_H * 0.44,
    noseTipY:     SCREEN_H * 0.52,
    noseLeftX:    SCREEN_W * 0.44,
    noseRightX:   SCREEN_W * 0.56,
    mouthY:       SCREEN_H * 0.60,
    mouthLeftX:   SCREEN_W * 0.40,
    mouthRightX:  SCREEN_W * 0.60,
    jawY:         SCREEN_H * 0.68,
    leftJawX:     SCREEN_W * 0.28,
    rightJawX:    SCREEN_W * 0.72,
    chinY:        SCREEN_H * 0.78,
    foreheadY:    SCREEN_H * 0.24,
    zygoLeftX:    SCREEN_W * 0.22,
    zygoRightX:   SCREEN_W * 0.78,
    zygoY:        SCREEN_H * 0.46,
    neckLeftX:    SCREEN_W * 0.34,
    neckRightX:   SCREEN_W * 0.66,
    neckY:        SCREEN_H * 0.72,
  };
}

export default function ScanScreen() {
  const router = useRouter();
  const { photoUri: paramPhotoUri } = useLocalSearchParams<{ photoUri: string }>();
  const [photoUri, setPhotoUri] = useState<string | null>(paramPhotoUri || null);
  const [faceCoords, setFaceCoords] = useState<FaceCoords>(makeFallback);

  const {
    currentMetric,
    currentMetricIndex,
    progress,
    scanLineY,
    goldLineY,
    isComplete,
  } = usePSLScanAnimation(faceCoords);

  // Animated style for the moving scan line (absolute pixel Y)
  const scanLineAnimatedStyle = useAnimatedStyle(() => ({
    top: scanLineY.value,
  }));

  // Load face coords saved by usePhotoCapture during the capture step
  useEffect(() => {
    AsyncStorage.getItem(FACE_COORDS_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setFaceCoords(JSON.parse(stored));
        } catch {
          setFaceCoords(makeFallback());
        }
      } else {
        setFaceCoords(makeFallback());
      }
    });
  }, []);

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

      {/* Background — user's front-facing photo */}
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.backgroundPhoto}
          resizeMode="cover"
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
      <GoldReferenceLine yPosition={goldLineY} leftX={faceCoords.zygoLeftX} rightX={faceCoords.zygoRightX} />

      {/* SVG AR overlay lines for current metric — remounted per metric for fade in/out.
          Only rendered once faceCoords are loaded (AsyncStorage read is fast,
          always completes before the first 1.2s metric window ends). */}
      {faceCoords && (
        <ScanOverlay
          key={currentMetricIndex}
          currentMetric={currentMetric}
          faceCoords={faceCoords}
        />
      )}

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
