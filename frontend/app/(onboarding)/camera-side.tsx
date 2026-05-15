import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, useCameraPermission, useCameraDevice } from 'react-native-vision-camera';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import BackArrow from '../../components/ui/BackArrow';
import FrostedButton from '../../components/ui/FrostedButton';
import { usePhotoCapture } from '../../hooks/usePhotoCapture';
import { COLORS, FONTS } from '../../lib/constants';

const { width: SW, height: SH } = Dimensions.get('window');
const VW = SW - 32;
const TOP_SECTION_H = 148;
const BOTTOM_SECTION_H = 136;
const SAFE_H = 56 + 36;
const VH = Math.min(VW * (4 / 3), SH - TOP_SECTION_H - BOTTOM_SECTION_H - SAFE_H);

export default function CameraSideScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromPremium = from === 'premium';

  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const device = useCameraDevice(facing);

  const { cameraRef, sidePhoto, capturePhoto, retakePhoto, importPhoto } = usePhotoCapture();
  const [isCapturing, setIsCapturing] = useState(false);

  const uiOpacity = useSharedValue(0);
  useEffect(() => {
    uiOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, []);
  const uiStyle = useAnimatedStyle(() => ({ opacity: uiOpacity.value }));

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    const result = await capturePhoto('side');
    setIsCapturing(false);
    if (!result.ok) {
      Alert.alert('Lỗi', result.error ?? 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const handlePickFromGallery = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!picked.canceled && picked.assets[0]) {
      const result = await importPhoto(picked.assets[0].uri, 'side');
      if (!result.ok) {
        Alert.alert('Lỗi', result.error ?? 'Không thể tải ảnh. Vui lòng thử lại.');
      }
    }
  };

  const handleContinue = () => {
    router.push(fromPremium ? '/(main)/scan' : '/(onboarding)/complete');
  };

  if (!hasPermission) {
    return (
      <TrailBackground>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            GLOWMAX CẦN QUYỀN TRUY CẬP CAMERA{'\n'}ĐỂ PHÂN TÍCH KHUÔN MẶT CỦA BẠN.
          </Text>
          <FrostedButton label="CẤP QUYỀN CAMERA" onPress={requestPermission} />
        </View>
      </TrailBackground>
    );
  }

  return (
    <TrailBackground>
      {fromPremium ? (
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.replace('/(premium)/scan')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      ) : (
        <BackArrow />
      )}
      <Animated.View style={[styles.container, uiStyle]}>

        {/* Top section */}
        <View style={styles.topSection}>
          <Text style={styles.title}>CHỤP ẢNH{'\n'}NGHIÊNG</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Svg width={13} height={13} viewBox="0 0 24 24">
                <Path d="M1 4v6h6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.badgeText}>NGHIÊNG 90° SANG PHẢI</Text>
            </View>
            <View style={styles.badge}>
              <Svg width={13} height={13} viewBox="0 0 24 24">
                <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
                <Path d="M8 15h8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                <Circle cx="9" cy="10" r="1.5" fill="white" />
                <Circle cx="15" cy="10" r="1.5" fill="white" />
              </Svg>
              <Text style={styles.badgeText}>GIỮ MẶT TỰ NHIÊN</Text>
            </View>
          </View>
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinderWrapper}>
          {sidePhoto ? (
            <Image source={{ uri: sidePhoto }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : device ? (
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFillObject}
              device={device}
              isActive={true}
              photo={true}
            />
          ) : null}

          {/* SIDE label pill */}
          <View style={styles.labelPill}>
            <Text style={styles.labelPillText}>NGHIÊNG</Text>
          </View>

          {/* Head silhouette overlay */}
          {!sidePhoto && (
            <Image
              source={require('../../assets/images/side1.png')}
              style={styles.silhouetteOverlay}
              resizeMode="contain"
            />
          )}

          {/* Gallery icon — bottom-left corner */}
          {!sidePhoto && (
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

          {/* Flip camera button — bottom-right corner */}
          {!sidePhoto && (
            <TouchableOpacity style={styles.flipViewfinderBtn} onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}>
              <Svg width={28} height={28} viewBox="0 0 24 24">
                <Path d="M1 4v6h6" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
                <Path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
              </Svg>
            </TouchableOpacity>
          )}
        </View>

        {/* Photo tip */}
        {!sidePhoto && (
          <Text style={styles.tipText}>
            Quay nghiêng 90° • Đủ sáng • Mặc trang phục lịch sự
          </Text>
        )}

        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {sidePhoto ? (
            <>
              <TouchableOpacity onPress={() => retakePhoto('side')} style={styles.retakeBtn}>
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
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: 36,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    padding: 4,
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
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 22,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 32,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  badgeText: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
    opacity: 0.75,
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
    left: VW / 2 - 36,
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

  // Silhouette
  silhouetteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: VW,
    height: VH,
    opacity: 0.65,
    tintColor: '#ffffff',
  },

  // Flip camera (inside viewfinder)
  flipViewfinderBtn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    padding: 4,
  },

  tipText: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 14,
    paddingHorizontal: 24,
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
