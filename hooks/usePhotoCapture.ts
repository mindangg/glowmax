import { useState, useRef, useCallback } from 'react';
import { CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

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

    const filename = `${type}_photo_${Date.now()}.jpg`;
    const dest = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: correctedUri, to: dest });

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

    const filename = `${type}_photo_${Date.now()}.jpg`;
    const dest = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: correctedUri, to: dest });
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
