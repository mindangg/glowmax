import { useState, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FaceDetector from 'expo-face-detector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildFaceCoords, FACE_COORDS_STORAGE_KEY } from '../lib/faceCoords';

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
 * Returns both the URI and the final pixel dimensions (needed for face coord mapping).
 */
async function cropToViewfinderRatio(
  uri: string,
): Promise<{ uri: string; width: number; height: number }> {
  try {
    // Bake to get pixel dimensions
    const info = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    const { width, height } = info;
    const currentRatio = width / height;

    if (Math.abs(currentRatio - VIEWFINDER_RATIO) < 0.02) {
      return { uri: info.uri, width, height };
    }

    let cropW = width;
    let cropH = height;
    if (currentRatio > VIEWFINDER_RATIO) {
      cropW = Math.round(height * VIEWFINDER_RATIO);
    } else {
      cropH = Math.round(width / VIEWFINDER_RATIO);
    }
    const ox = Math.floor((width - cropW) / 2);
    const oy = Math.floor((height - cropH) / 2);

    const cropped = await ImageManipulator.manipulateAsync(
      info.uri,
      [{ crop: { originX: ox, originY: oy, width: cropW, height: cropH } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
    );
    return { uri: cropped.uri, width: cropW, height: cropH };
  } catch {
    // Fall back — get dims from the uri directly
    const info = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { uri, width: info.width, height: info.height };
  }
}

/**
 * Runs face detection on a processed image URI.
 * Returns true and saves FaceCoords to AsyncStorage on success.
 * Returns false if no face is detected (caller should show an error).
 *
 * Only called for front photos — side photos don't need overlay coords.
 */
async function detectAndSaveFaceCoords(
  uri: string,
  imgWidth: number,
  imgHeight: number,
): Promise<boolean> {
  try {
    const result = await FaceDetector.detectFacesAsync(uri, {
      mode: FaceDetector.FaceDetectorMode.accurate,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.none,
    });

    if (!result.faces || result.faces.length === 0) return false;

    // Pick the face with the largest bounding box if multiple detected
    const face = result.faces.reduce((best, f) =>
      f.bounds.size.width * f.bounds.size.height >
      best.bounds.size.width * best.bounds.size.height
        ? f
        : best,
    );

    const coords = buildFaceCoords(face, imgWidth, imgHeight);
    await AsyncStorage.setItem(FACE_COORDS_STORAGE_KEY, JSON.stringify(coords));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------

export function usePhotoCapture() {
  const cameraRef = useRef<CameraView>(null);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);

  const capturePhoto = useCallback(
    async (type: 'front' | 'side'): Promise<{ ok: boolean; error?: string }> => {
      if (!cameraRef.current) return { ok: false, error: 'Camera chưa sẵn sàng.' };

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        exif: true,
        skipProcessing: false,
      });
      if (!photo) return { ok: false, error: 'Không thể chụp ảnh.' };

      const orientation = (photo.exif as any)?.Orientation as number | undefined;
      const correctedUri = await correctPhoto(photo.uri, orientation, true);
      const cropped = await cropToViewfinderRatio(correctedUri);

      // Front photo: detect face before accepting
      if (type === 'front') {
        const faceFound = await detectAndSaveFaceCoords(
          cropped.uri,
          cropped.width,
          cropped.height,
        );
        if (!faceFound) {
          return {
            ok: false,
            error: 'Không phát hiện được khuôn mặt. Hãy chắc chắn mặt bạn nhìn thẳng vào camera và đủ ánh sáng, rồi chụp lại.',
          };
        }
      }

      const filename = `${type}_photo_${Date.now()}.jpg`;
      const dest = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: cropped.uri, to: dest });

      if (type === 'front') setFrontPhoto(dest);
      else setSidePhoto(dest);

      return { ok: true };
    },
    [],
  );

  const retakePhoto = useCallback((type: 'front' | 'side') => {
    if (type === 'front') setFrontPhoto(null);
    else setSidePhoto(null);
  }, []);

  const importPhoto = useCallback(
    async (uri: string, type: 'front' | 'side'): Promise<{ ok: boolean; error?: string }> => {
      const correctedUri = await correctPhoto(uri);
      const cropped = await cropToViewfinderRatio(correctedUri);

      if (type === 'front') {
        const faceFound = await detectAndSaveFaceCoords(
          cropped.uri,
          cropped.width,
          cropped.height,
        );
        if (!faceFound) {
          return {
            ok: false,
            error: 'Không phát hiện được khuôn mặt trong ảnh này. Vui lòng chọn ảnh khác có khuôn mặt nhìn thẳng, đủ sáng.',
          };
        }
      }

      const filename = `${type}_photo_${Date.now()}.jpg`;
      const dest = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: cropped.uri, to: dest });

      if (type === 'front') setFrontPhoto(dest);
      else setSidePhoto(dest);

      return { ok: true };
    },
    [],
  );

  const getBase64 = useCallback(
    async (type: 'front' | 'side'): Promise<string | null> => {
      const uri = type === 'front' ? frontPhoto : sidePhoto;
      if (!uri) return null;
      return FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    },
    [frontPhoto, sidePhoto],
  );

  return { cameraRef, frontPhoto, sidePhoto, capturePhoto, retakePhoto, importPhoto, getBase64 };
}
