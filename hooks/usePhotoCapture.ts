import { useState, useRef, useCallback } from 'react';
import { CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';

export function usePhotoCapture() {
  const cameraRef = useRef<CameraView>(null);
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);

  const capturePhoto = useCallback(async (type: 'front' | 'side') => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (!photo) return;

    const filename = `${type}_photo_${Date.now()}.jpg`;
    const dest = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: photo.uri, to: dest });

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
    const filename = `${type}_photo_${Date.now()}.jpg`;
    const dest = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: uri, to: dest });
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
