import { useState, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import FaceDetection from '@react-native-ml-kit/face-detection';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buildFaceCoords,
  estimateFaceCoords,
  FACE_COORDS_STORAGE_KEY,
  type NormalizedFace,
} from '../lib/faceCoords';

const { width: SW, height: SH } = Dimensions.get('window');
const VW = SW - 32;
const VH = Math.min(VW * (4 / 3), SH - 148 - 136 - 92);
const VIEWFINDER_RATIO = VW / VH;

async function correctPhoto(uri: string, exifOrientation?: number): Promise<string> {
  try {
    const transforms: ImageManipulator.Action[] = [];
    let rotation = 0;
    if (exifOrientation === 6) rotation = 90;
    else if (exifOrientation === 8) rotation = -90;
    else if (exifOrientation === 3) rotation = 180;
    if (rotation !== 0) transforms.push({ rotate: rotation });

    if (transforms.length > 0) {
      const result = await ImageManipulator.manipulateAsync(uri, transforms, {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      return result.uri;
    }

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

async function cropToViewfinderRatio(
  uri: string,
): Promise<{ uri: string; width: number; height: number }> {
  try {
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
    const info = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { uri, width: info.width, height: info.height };
  }
}

// Detects the largest face in the cropped image and returns normalized coords.
// Falls back to null if ML Kit fails or no face found.
async function detectAndNormalizeFace(
  uri: string,
  imgW: number,
  imgH: number,
): Promise<NormalizedFace | null> {
  try {
    const faces = await FaceDetection.detect(uri, {
      performanceMode: 'accurate',
      landmarkMode: 'all',
      contourMode: 'none',
      classificationMode: 'none',
    });
    if (!faces || faces.length === 0) return null;
    const face = faces.reduce((best, f) =>
      f.frame.width * f.frame.height > best.frame.width * best.frame.height ? f : best,
    );
    const lm = face.landmarks;
    const p = (lm: { position: { x: number; y: number } } | undefined, w: number, h: number) =>
      lm ? { x: lm.position.x / w, y: lm.position.y / h } : undefined;
    return {
      bounds: {
        x: face.frame.left / imgW,
        y: face.frame.top / imgH,
        width: face.frame.width / imgW,
        height: face.frame.height / imgH,
      },
      landmarks: lm
        ? {
            LEFT_EYE:    p(lm.leftEye,    imgW, imgH),
            RIGHT_EYE:   p(lm.rightEye,   imgW, imgH),
            NOSE_BASE:   p(lm.noseBase,   imgW, imgH),
            MOUTH_LEFT:  p(lm.mouthLeft,  imgW, imgH),
            MOUTH_RIGHT: p(lm.mouthRight, imgW, imgH),
            LEFT_EAR:    p(lm.leftEar,    imgW, imgH),
            RIGHT_EAR:   p(lm.rightEar,   imgW, imgH),
            LEFT_CHEEK:  p(lm.leftCheek,  imgW, imgH),
            RIGHT_CHEEK: p(lm.rightCheek, imgW, imgH),
          }
        : undefined,
    };
  } catch {
    return null;
  }
}

export function usePhotoCapture() {
  const cameraRef = useRef<Camera>(null);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto]   = useState<string | null>(null);

  const capturePhoto = useCallback(
    async (type: 'front' | 'side'): Promise<{ ok: boolean; error?: string }> => {
      if (!cameraRef.current) return { ok: false, error: 'Camera chưa sẵn sàng.' };

      try {
        const photo   = await cameraRef.current.takePhoto();
        const uri     = `file://${photo.path}`;
        const cropped = await cropToViewfinderRatio(uri);

        if (type === 'front') {
          const detected = await detectAndNormalizeFace(cropped.uri, cropped.width, cropped.height);
          const coords   = detected
            ? buildFaceCoords(detected, cropped.width, cropped.height)
            : estimateFaceCoords(cropped.width, cropped.height);
          await AsyncStorage.setItem(FACE_COORDS_STORAGE_KEY, JSON.stringify(coords));
        }

        const filename = `${type}_photo_${Date.now()}.jpg`;
        const dest     = FileSystem.documentDirectory + filename;
        await FileSystem.copyAsync({ from: cropped.uri, to: dest });

        if (type === 'front') setFrontPhoto(dest);
        else setSidePhoto(dest);

        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e?.message ?? 'Không thể chụp ảnh.' };
      }
    },
    [],
  );

  const retakePhoto = useCallback((type: 'front' | 'side') => {
    if (type === 'front') setFrontPhoto(null);
    else setSidePhoto(null);
  }, []);

  const importPhoto = useCallback(
    async (uri: string, type: 'front' | 'side'): Promise<{ ok: boolean; error?: string }> => {
      try {
        const correctedUri = await correctPhoto(uri);
        const cropped      = await cropToViewfinderRatio(correctedUri);

        if (type === 'front') {
          const detected = await detectAndNormalizeFace(cropped.uri, cropped.width, cropped.height);
          const coords   = detected
            ? buildFaceCoords(detected, cropped.width, cropped.height)
            : estimateFaceCoords(cropped.width, cropped.height);
          await AsyncStorage.setItem(FACE_COORDS_STORAGE_KEY, JSON.stringify(coords));
        }

        const filename = `${type}_photo_${Date.now()}.jpg`;
        const dest     = FileSystem.documentDirectory + filename;
        await FileSystem.copyAsync({ from: cropped.uri, to: dest });

        if (type === 'front') setFrontPhoto(dest);
        else setSidePhoto(dest);

        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e?.message ?? 'Không thể tải ảnh.' };
      }
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
