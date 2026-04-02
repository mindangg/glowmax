import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import GrainBackground from '../../components/backgrounds/GrainBackground';
import FrostedButton from '../../components/ui/FrostedButton';
import { usePhotoCapture } from '../../hooks/usePhotoCapture';
import { COLORS, FONTS } from '../../lib/constants';

const { width: SW, height: SH } = Dimensions.get('window');

// Viewfinder fills available space, capped at 3:4 ratio
const VW = SW - 32;
const TOP_SECTION_H = 148;   // title + badges
const BOTTOM_SECTION_H = 136; // dots + button + spacing
const SAFE_H = 56 + 36;
const VH = Math.min(VW * (4 / 3), SH - TOP_SECTION_H - BOTTOM_SECTION_H - SAFE_H);

// Head silhouette path coords
const cx = VW / 2;
const hw = VW * 0.29;
const topY = VH * 0.05;
const midY = VH * 0.36;
const botY = VH * 0.63;
const HEAD_PATH = [
  `M ${cx} ${topY}`,
  `C ${cx + hw * 1.15} ${topY} ${cx + hw * 1.15} ${midY * 0.65} ${cx + hw} ${midY}`,
  `C ${cx + hw * 0.95} ${botY * 0.88} ${cx + hw * 0.65} ${botY} ${cx} ${botY}`,
  `C ${cx - hw * 0.65} ${botY} ${cx - hw * 0.95} ${botY * 0.88} ${cx - hw} ${midY}`,
  `C ${cx - hw * 1.15} ${midY * 0.65} ${cx - hw * 1.15} ${topY} ${cx} ${topY}`,
  'Z',
].join(' ');

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { cameraRef, frontPhoto, capturePhoto, retakePhoto, importPhoto } = usePhotoCapture();
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');

  const uiOpacity = useSharedValue(0);
  useEffect(() => {
    uiOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, []);
  const uiStyle = useAnimatedStyle(() => ({ opacity: uiOpacity.value }));

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    await capturePhoto('front');
    setIsCapturing(false);
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await importPhoto(result.assets[0].uri, 'front');
    }
  };

  const handleContinue = () => {
    router.push('/(onboarding)/camera-side');
  };

  if (!permission?.granted) {
    return (
      <GrainBackground>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            GLOWMAX CẦN QUYỀN TRUY CẬP CAMERA{'\n'}ĐỂ PHÂN TÍCH KHUÔN MẶT CỦA BẠN.
          </Text>
          <FrostedButton label="CẤP QUYỀN CAMERA" onPress={requestPermission} />
        </View>
      </GrainBackground>
    );
  }

  return (
    <GrainBackground>
      <Animated.View style={[styles.container, uiStyle]}>

        {/* Top section */}
        <View style={styles.topSection}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>CHỤP ẢNH{'\n'}CHÍNH DIỆN</Text>
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>🔒</Text>
                <Text style={styles.badgeText}>BẢO MẬT 100%</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>✓</Text>
                <Text style={styles.badgeText}>10,000+ LƯỢT ĐÁNH GIÁ</Text>
              </View>
            </View>
          </View>

          {/* Flip camera button */}
          <TouchableOpacity
            style={styles.flipBtn}
            onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}
          >
            <Text style={styles.flipBtnText}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinderWrapper}>
          {frontPhoto ? (
            <Image source={{ uri: frontPhoto }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : (
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing={facing} />
          )}

          {/* FRONT label pill */}
          <View style={styles.labelPill}>
            <Text style={styles.labelPillText}>FRONT</Text>
          </View>

          {/* Head silhouette overlay */}
          {!frontPhoto && (
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              <Svg width={VW} height={VH}>
                <Path d={HEAD_PATH} fill="rgba(255,255,255,0.20)" />
              </Svg>
            </View>
          )}

          {/* Gallery icon — bottom-left corner */}
          {!frontPhoto && (
            <TouchableOpacity style={styles.galleryIconBtn} onPress={handlePickFromGallery}>
              <Svg width={28} height={28} viewBox="0 0 28 28">
                <Rect x="2" y="2" width="24" height="24" rx="4" ry="4"
                  stroke="white" strokeWidth="1.5" fill="none" opacity={0.85} />
                <Circle cx="8.5" cy="9" r="2.2" fill="white" opacity={0.85} />
                <Path
                  d="M 2 20 L 9 13 L 15 19 L 19 15 L 26 21"
                  stroke="white" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="none" opacity={0.85}
                />
              </Svg>
            </TouchableOpacity>
          )}
        </View>

        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {frontPhoto ? (
            <>
              <TouchableOpacity onPress={() => retakePhoto('front')} style={styles.retakeBtn}>
                <Text style={styles.retakeText}>CHỤP LẠI</Text>
              </TouchableOpacity>
              <FrostedButton label="TIẾP TỤC" onPress={handleContinue} />
            </>
          ) : (
            <FrostedButton
              label={isCapturing ? 'ĐANG CHỤP...' : 'CHỤP ẢNH'}
              onPress={handleCapture}
              disabled={isCapturing}
            />
          )}
        </View>

      </Animated.View>
    </GrainBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: 36,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  permissionText: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Top section
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleArea: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 26,
    marginBottom: 10,
  },
  badges: {
    flexDirection: 'row',
    gap: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeIcon: {
    fontSize: 11,
    color: COLORS.ACCENT_GOLD,
  },
  badgeText: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    color: COLORS.MUTED_GRAY,
    letterSpacing: 0.5,
  },

  // Flip button
  flipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  flipBtnText: {
    fontSize: 22,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 26,
  },

  // Viewfinder
  viewfinderWrapper: {
    width: VW,
    height: VH,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  // Label pill
  labelPill: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    left: VW / 2 - 44,
    backgroundColor: 'rgba(80,80,80,0.65)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  labelPillText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
  },

  // Gallery icon
  galleryIconBtn: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    padding: 4,
  },

  // Pagination
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: COLORS.TEXT_PRIMARY,
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Actions
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 10,
  },
  retakeBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  retakeText: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.MUTED_GRAY,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
