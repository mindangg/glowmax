import { useState, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

const { width: SW, height: SH } = Dimensions.get('window');
const VW = SW - 32;
const VH = Math.min(VW * (4 / 3), SH - 148 - 136 - 92);
const VIEWFINDER_RATIO = VW / VH; // width/height ≈ 0.765 (≈ 3:4 portrait)

/**
 * Corrects photo orientation and optionally flips horizontally.
 * Front camera selfies need flipHorizontal = true to un-mirror.
 * EXIF orientation 6 = needs +90°, 8 = needs -90°, 3 = needs 180°.
 */
async function correctPhoto(
  uri: string,
  exifOrientation?: number,
  flipHorizontal = false,
): Promise<string> {
  try {
    const transforms: ImageManipulator.Action[] = [];

    // 1. Rotation based on EXIF
    let rotation = 0;
    if (exifOrientation === 6) rotation = 90;
    else if (exifOrientation === 8) rotation = -90;
    else if (exifOrientation === 3) rotation = 180;

    if (rotation !== 0) {
      transforms.push({ rotate: rotation });
    }

    // 2. Horizontal flip for front camera mirror correction
    if (flipHorizontal) {
      transforms.push({ flip: ImageManipulator.FlipType.Horizontal });
    }

    if (transforms.length > 0) {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        transforms,
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      return result.uri;
    }

    // No EXIF and no flip needed — just bake and check pixel dims
    const resolved = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.85,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    if (resolved.width > resolved.height) {
      const rotated = await ImageManipulator.manipulateAsync(
        resolved.uri,
        [{ rotate: 90 }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      return rotated.uri;
    }
    return resolved.uri;
  } catch {
    return uri;
  }
}

/**
 * Crops image to match the viewfinder aspect ratio (center crop).
 * This ensures the saved photo matches exactly what was shown in the viewfinder.
 */
async function cropToViewfinderRatio(uri: string): Promise<string> {
  try {
    // Bake to get pixel dimensions
    const info = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    const { width, height } = info;
    const currentRatio = width / height;

    if (Math.abs(currentRatio - VIEWFINDER_RATIO) < 0.02) return info.uri;

    let cropW = width;
    let cropH = height;
    if (currentRatio > VIEWFINDER_RATIO) {
      // Too wide → crop width
      cropW = Math.round(height * VIEWFINDER_RATIO);
    } else {
      // Too tall → crop height
      cropH = Math.round(width / VIEWFINDER_RATIO);
    }
    const ox = Math.floor((width - cropW) / 2);
    const oy = Math.floor((height - cropH) / 2);

    const cropped = await ImageManipulator.manipulateAsync(
      info.uri,
      [{ crop: { originX: ox, originY: oy, width: cropW, height: cropH } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
    );
    return cropped.uri;
  } catch {
    return uri;
  }
}

export function usePhotoCapture() {
  const cameraRef = useRef<CameraView>(null);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);

  const capturePhoto = useCallback(async (type: 'front' | 'side') => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      exif: true,
      skipProcessing: false,
    });
    if (!photo) return;

    const orientation = (photo.exif as any)?.Orientation as number | undefined;
    // Front camera selfies are mirrored — flip horizontally to correct
    const correctedUri = await correctPhoto(photo.uri, orientation, true);
    const croppedUri = await cropToViewfinderRatio(correctedUri);

    const filename = `${type}_photo_${Date.now()}.jpg`;
    const dest = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: croppedUri, to: dest });

    if (type === 'front') {
      setFrontPhoto(dest);
    } else {
      setSidePhoto(dest);
    }
  }, []);

  const retakePhoto = useCallback((type: 'front' | 'side') => {
    if (type === 'front') setFrontPhoto(null);
    else setSidePhoto(null);
  }, []);

  const importPhoto = useCallback(async (uri: string, type: 'front' | 'side') => {
    // Gallery photos: correct orientation only, no mirror flip needed
    const correctedUri = await correctPhoto(uri);
    const croppedUri = await cropToViewfinderRatio(correctedUri);

    const filename = `${type}_photo_${Date.now()}.jpg`;
    const dest = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: croppedUri, to: dest });
    if (type === 'front') setFrontPhoto(dest);
    else setSidePhoto(dest);
  }, []);

  const getBase64 = useCallback(async (type: 'front' | 'side'): Promise<string | null> => {
    const uri = type === 'front' ? frontPhoto : sidePhoto;
    if (!uri) return null;
    return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  }, [frontPhoto, sidePhoto]);

  return { cameraRef, frontPhoto, sidePhoto, capturePhoto, retakePhoto, importPhoto, getBase64 };
}
