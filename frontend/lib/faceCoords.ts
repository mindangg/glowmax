import { Dimensions } from 'react-native';
import { FaceFeature } from 'expo-face-detector';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// FaceCoords — screen-space coordinates of key face landmarks.
// Used by ScanOverlay to position AR metric lines on the real face.
// ---------------------------------------------------------------------------
export type FaceCoords = {
  cx: number;         // face center X
  leX: number;        // left eye X
  reX: number;        // right eye X
  eyeY: number;       // eye level Y
  noseBridgeY: number;
  noseTipY: number;
  noseLeftX: number;
  noseRightX: number;
  mouthY: number;
  mouthLeftX: number;
  mouthRightX: number;
  jawY: number;
  leftJawX: number;
  rightJawX: number;
  chinY: number;
  foreheadY: number;
  zygoLeftX: number;
  zygoRightX: number;
  zygoY: number;
  neckLeftX: number;
  neckRightX: number;
  neckY: number;
};

// AsyncStorage key used to persist coords between capture screen and scan screen
export const FACE_COORDS_STORAGE_KEY = 'glowmax_face_coords_latest';

// ---------------------------------------------------------------------------
// Cover-scale helpers — maps image pixel coords → screen coords.
// The scan screen renders the photo with resizeMode="cover", so we replicate
// the same transform here to get matching overlay positions.
// ---------------------------------------------------------------------------
function coverTransform(imgW: number, imgH: number) {
  const scale = Math.max(SCREEN_W / imgW, SCREEN_H / imgH);
  const offsetX = (SCREEN_W - imgW * scale) / 2;
  const offsetY = (SCREEN_H - imgH * scale) / 2;
  return {
    pt: (px: number, py: number) => ({
      x: px * scale + offsetX,
      y: py * scale + offsetY,
    }),
    // Converts a pixel-space length into screen-space length
    len: (pixels: number) => pixels * scale,
  };
}

// ---------------------------------------------------------------------------
// buildFaceCoords — converts a FaceDetector result into FaceCoords.
// imgW / imgH are the pixel dimensions of the image that was detected on.
// ---------------------------------------------------------------------------
export function buildFaceCoords(
  face: FaceFeature,
  imgW: number,
  imgH: number,
): FaceCoords {
  const { pt, len } = coverTransform(imgW, imgH);

  // Bounding box
  const { origin, size } = face.bounds;
  const faceLeft   = origin.x;
  const faceTop    = origin.y;
  const faceW      = size.width;
  const faceH      = size.height;
  const faceCenterX = faceLeft + faceW / 2;

  // ── Eyes ──────────────────────────────────────────────────────────────────
  const rawLE = face.leftEyePosition  ?? { x: faceLeft + faceW * 0.36, y: faceTop + faceH * 0.38 };
  const rawRE = face.rightEyePosition ?? { x: faceLeft + faceW * 0.64, y: faceTop + faceH * 0.38 };
  const le = pt(rawLE.x, rawLE.y);
  const re = pt(rawRE.x, rawRE.y);
  // Guarantee leX < reX regardless of camera mirroring
  const leX = Math.min(le.x, re.x);
  const reX = Math.max(le.x, re.x);
  const eyeY = (le.y + re.y) / 2;
  const eyeSpan = reX - leX;   // used to derive other widths proportionally

  // ── Nose ──────────────────────────────────────────────────────────────────
  const rawNose = face.noseBasePosition ?? { x: faceCenterX, y: faceTop + faceH * 0.65 };
  const noseBase = pt(rawNose.x, rawNose.y);
  const cx = noseBase.x;                              // center X from nose
  const noseTipY    = noseBase.y;
  const noseBridgeY = eyeY + (noseTipY - eyeY) * 0.35;
  const noseHalfW   = eyeSpan * 0.22;                // ~44% of eye span

  // ── Mouth ─────────────────────────────────────────────────────────────────
  const rawLM = face.leftMouthPosition  ?? { x: faceLeft + faceW * 0.40, y: faceTop + faceH * 0.78 };
  const rawRM = face.rightMouthPosition ?? { x: faceLeft + faceW * 0.60, y: faceTop + faceH * 0.78 };
  const lm = pt(rawLM.x, rawLM.y);
  const rm = pt(rawRM.x, rawRM.y);
  const mouthLeftX  = Math.min(lm.x, rm.x);
  const mouthRightX = Math.max(lm.x, rm.x);
  const mouthY      = (lm.y + rm.y) / 2;

  // ── Forehead & chin from bounding box ────────────────────────────────────
  const foreheadPt = pt(faceCenterX, faceTop);
  const chinPt     = pt(faceCenterX, faceTop + faceH);
  const foreheadY  = foreheadPt.y;
  const chinY      = chinPt.y;

  // ── Jaw (between mouth and chin) ──────────────────────────────────────────
  const jawY = mouthY + (chinY - mouthY) * 0.55;

  // Jaw width: use ear positions when available, else estimate from bounding box
  const rawLEar = face.leftEarPosition  ?? { x: faceLeft,        y: faceTop + faceH * 0.50 };
  const rawREar = face.rightEarPosition ?? { x: faceLeft + faceW, y: faceTop + faceH * 0.50 };
  const lEar = pt(rawLEar.x, rawLEar.y);
  const rEar = pt(rawREar.x, rawREar.y);
  const leftJawX  = Math.min(lEar.x, rEar.x);
  const rightJawX = Math.max(lEar.x, rEar.x);

  // ── Cheeks (zygomatic) ────────────────────────────────────────────────────
  const rawLC = face.leftCheekPosition  ?? { x: faceLeft + faceW * 0.18, y: faceTop + faceH * 0.52 };
  const rawRC = face.rightCheekPosition ?? { x: faceLeft + faceW * 0.82, y: faceTop + faceH * 0.52 };
  const lc = pt(rawLC.x, rawLC.y);
  const rc = pt(rawRC.x, rawRC.y);
  const zygoLeftX  = Math.min(lc.x, rc.x);
  const zygoRightX = Math.max(lc.x, rc.x);
  const zygoY      = (lc.y + rc.y) / 2;

  // ── Neck (estimated below chin) ───────────────────────────────────────────
  const neckY      = chinY + len(faceH * 0.10);
  const neckHalfW  = (mouthRightX - mouthLeftX) * 0.8;

  return {
    cx,
    leX,
    reX,
    eyeY,
    noseBridgeY,
    noseTipY,
    noseLeftX:  cx - noseHalfW,
    noseRightX: cx + noseHalfW,
    mouthY,
    mouthLeftX,
    mouthRightX,
    jawY,
    leftJawX,
    rightJawX,
    chinY,
    foreheadY,
    zygoLeftX,
    zygoRightX,
    zygoY,
    neckLeftX:  cx - neckHalfW,
    neckRightX: cx + neckHalfW,
    neckY,
  };
}
