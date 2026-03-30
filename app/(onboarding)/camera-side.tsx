import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path } from 'react-native-svg';
import ChromaticGlassBackground from '../../components/backgrounds/ChromaticGlassBackground';
import BackArrow from '../../components/ui/BackArrow';
import FrostedButton from '../../components/ui/FrostedButton';
import { usePhotoCapture } from '../../hooks/usePhotoCapture';
import { COLORS, FONTS } from '../../lib/constants';

const { width: SW } = Dimensions.get('window');
const VIEWFINDER_SIZE = SW - 64;

const CX = VIEWFINDER_SIZE / 2;
const CY = VIEWFINDER_SIZE / 2 - 20;
const RX = VIEWFINDER_SIZE * 0.28;
const RY = VIEWFINDER_SIZE * 0.38;
const BKT = 18;

export default function CameraSideScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { cameraRef, sidePhoto, capturePhoto, retakePhoto, importPhoto } = usePhotoCapture();
  const [isCapturing, setIsCapturing] = useState(false);

  const uiOpacity = useSharedValue(0);

  useEffect(() => {
    uiOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, []);

  const uiStyle = useAnimatedStyle(() => ({ opacity: uiOpacity.value }));

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    await capturePhoto('side');
    setIsCapturing(false);
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await importPhoto(result.assets[0].uri, 'side');
    }
  };

  const handleContinue = () => {
    router.push('/(onboarding)/complete');
  };

  if (!permission?.granted) {
    return (
      <ChromaticGlassBackground>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            GLOWMAX CẦN QUYỀN TRUY CẬP CAMERA{'\n'}ĐỂ PHÂN TÍCH KHUÔN MẶT CỦA BẠN.
          </Text>
          <FrostedButton label="CẤP QUYỀN CAMERA" onPress={requestPermission} />
        </View>
      </ChromaticGlassBackground>
    );
  }

  return (
    <ChromaticGlassBackground>
      <BackArrow />
      <Animated.View style={[styles.container, uiStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CHỤP ẢNH NGHIÊNG</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>↩</Text>
              <Text style={styles.badgeText}>NGHIÊNG 90° SANG PHẢI</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>😐</Text>
              <Text style={styles.badgeText}>GIỮ MẶT TỰ NHIÊN</Text>
            </View>
          </View>
        </View>

        {/* Camera viewfinder or preview */}
        <View style={styles.viewfinderWrapper}>
          {sidePhoto ? (
            <Image source={{ uri: sidePhoto }} style={styles.preview} />
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            />
          )}

          {/* Face guide overlay */}
          {!sidePhoto && (
            <View style={styles.overlay} pointerEvents="none">
              <Svg width={VIEWFINDER_SIZE} height={VIEWFINDER_SIZE} viewBox={`0 0 ${VIEWFINDER_SIZE} ${VIEWFINDER_SIZE}`}>
                {/* Face oval */}
                <Ellipse
                  cx={CX}
                  cy={CY}
                  rx={RX}
                  ry={RY}
                  stroke={COLORS.ACCENT_GOLD}
                  strokeWidth="1.5"
                  fill="none"
                  opacity={0.7}
                />
                {/* Top-left bracket */}
                <Path
                  d={`M ${CX - RX + BKT},${CY - RY} L ${CX - RX},${CY - RY} L ${CX - RX},${CY - RY + BKT}`}
                  stroke={COLORS.ACCENT_GOLD}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Top-right bracket */}
                <Path
                  d={`M ${CX + RX - BKT},${CY - RY} L ${CX + RX},${CY - RY} L ${CX + RX},${CY - RY + BKT}`}
                  stroke={COLORS.ACCENT_GOLD}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Bottom-left bracket */}
                <Path
                  d={`M ${CX - RX + BKT},${CY + RY} L ${CX - RX},${CY + RY} L ${CX - RX},${CY + RY - BKT}`}
                  stroke={COLORS.ACCENT_GOLD}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Bottom-right bracket */}
                <Path
                  d={`M ${CX + RX - BKT},${CY + RY} L ${CX + RX},${CY + RY} L ${CX + RX},${CY + RY - BKT}`}
                  stroke={COLORS.ACCENT_GOLD}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
              <Text style={styles.hintText}>ĐẶT KHUÔN MẶT VÀO KHUNG</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {sidePhoto ? (
            <>
              <TouchableOpacity onPress={() => retakePhoto('side')} style={styles.retakeBtn}>
                <Text style={styles.retakeText}>CHỤP LẠI</Text>
              </TouchableOpacity>
              <FrostedButton label="TIẾP TỤC" onPress={handleContinue} />
            </>
          ) : (
            <>
              <FrostedButton
                label={isCapturing ? 'ĐANG CHỤP...' : 'CHỤP ẢNH'}
                onPress={handleCapture}
                disabled={isCapturing}
              />
              <TouchableOpacity onPress={handlePickFromGallery} style={styles.galleryBtn}>
                <Text style={styles.galleryText}>CHỌN TỪ THƯ VIỆN</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </ChromaticGlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
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
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: {
    fontSize: 12,
    color: COLORS.ACCENT_GOLD,
  },
  badgeText: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.MUTED_GRAY,
    letterSpacing: 0.5,
  },
  viewfinderWrapper: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    position: 'absolute',
    bottom: 16,
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 60,
    gap: 12,
  },
  retakeBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  retakeText: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.MUTED_GRAY,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
  galleryBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  galleryText: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.MUTED_GRAY,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
