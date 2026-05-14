import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// NormalizedFace — face landmarks in 0-1 range relative to frame dimensions.
// Produced by the VisionCamera frame processor, stored as a shared value,
// and consumed by buildFaceCoords at capture time.
// ---------------------------------------------------------------------------
export type NormalizedFace = {
  bounds: { x: number; y: number; width: number; height: number };
  landmarks?: {
    LEFT_EYE?: { x: number; y: number };
    RIGHT_EYE?: { x: number; y: number };
    NOSE_BASE?: { x: number; y: number };
    MOUTH_LEFT?: { x: number; y: number };
    MOUTH_RIGHT?: { x: number; y: number };
    LEFT_EAR?: { x: number; y: number };
    RIGHT_EAR?: { x: number; y: number };
    LEFT_CHEEK?: { x: number; y: number };
    RIGHT_CHEEK?: { x: number; y: number };
  };
};

// ---------------------------------------------------------------------------
// FaceCoords — screen-space coordinates of key face landmarks.
// Used by ScanOverlay to position AR metric lines on the real face.
// ---------------------------------------------------------------------------
export type FaceCoords = {
  cx: number;
  leX: number;
  reX: number;
  eyeY: number;
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

export const FACE_COORDS_STORAGE_KEY = 'glowmax_face_coords_latest';

// ---------------------------------------------------------------------------
// coverTransform — maps image pixel coords → screen coords.
// Replicates resizeMode="cover" so overlay positions match the displayed photo.
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
    len: (pixels: number) => pixels * scale,
  };
}

// ---------------------------------------------------------------------------
// estimateFaceCoords — fallback when no face was detected.
// Assumes face is centered and occupies ~64% width, 70% height of the image.
// ---------------------------------------------------------------------------
export function estimateFaceCoords(imgW: number, imgH: number): FaceCoords {
  return buildFaceCoords(
    { bounds: { x: 0.18, y: 0.12, width: 0.64, height: 0.70 } },
    imgW,
    imgH,
  );
}

// ---------------------------------------------------------------------------
// buildFaceCoords — converts a NormalizedFace (0-1 coords) into screen-space
// FaceCoords. imgW / imgH are the final cropped photo pixel dimensions.
// ---------------------------------------------------------------------------
export function buildFaceCoords(
  face: NormalizedFace,
  imgW: number,
  imgH: number,
): FaceCoords {
  const { pt, len } = coverTransform(imgW, imgH);
  const lm = face.landmarks;

  const faceLeft    = face.bounds.x * imgW;
  const faceTop     = face.bounds.y * imgH;
  const faceW       = face.bounds.width * imgW;
  const faceH       = face.bounds.height * imgH;
  const faceCenterX = faceLeft + faceW / 2;

  // ── Eyes ──────────────────────────────────────────────────────────────────
  const rawLE = lm?.LEFT_EYE
    ? { x: lm.LEFT_EYE.x * imgW, y: lm.LEFT_EYE.y * imgH }
    : { x: faceLeft + faceW * 0.36, y: faceTop + faceH * 0.38 };
  const rawRE = lm?.RIGHT_EYE
    ? { x: lm.RIGHT_EYE.x * imgW, y: lm.RIGHT_EYE.y * imgH }
    : { x: faceLeft + faceW * 0.64, y: faceTop + faceH * 0.38 };
  const le = pt(rawLE.x, rawLE.y);
  const re = pt(rawRE.x, rawRE.y);
  const leX     = Math.min(le.x, re.x);
  const reX     = Math.max(le.x, re.x);
  const eyeY    = (le.y + re.y) / 2;
  const eyeSpan = reX - leX;

  // ── Nose ──────────────────────────────────────────────────────────────────
  const rawNose = lm?.NOSE_BASE
    ? { x: lm.NOSE_BASE.x * imgW, y: lm.NOSE_BASE.y * imgH }
    : { x: faceCenterX, y: faceTop + faceH * 0.65 };
  const noseBase    = pt(rawNose.x, rawNose.y);
  const cx          = noseBase.x;
  const noseTipY    = noseBase.y;
  const noseBridgeY = eyeY + (noseTipY - eyeY) * 0.35;
  const noseHalfW   = eyeSpan * 0.22;

  // ── Mouth ─────────────────────────────────────────────────────────────────
  const rawLM = lm?.MOUTH_LEFT
    ? { x: lm.MOUTH_LEFT.x * imgW, y: lm.MOUTH_LEFT.y * imgH }
    : { x: faceLeft + faceW * 0.40, y: faceTop + faceH * 0.78 };
  const rawRM = lm?.MOUTH_RIGHT
    ? { x: lm.MOUTH_RIGHT.x * imgW, y: lm.MOUTH_RIGHT.y * imgH }
    : { x: faceLeft + faceW * 0.60, y: faceTop + faceH * 0.78 };
  const lmPt       = pt(rawLM.x, rawLM.y);
  const rmPt       = pt(rawRM.x, rawRM.y);
  const mouthLeftX  = Math.min(lmPt.x, rmPt.x);
  const mouthRightX = Math.max(lmPt.x, rmPt.x);
  const mouthY      = (lmPt.y + rmPt.y) / 2;

  // ── Forehead & chin ───────────────────────────────────────────────────────
  const foreheadY = pt(faceCenterX, faceTop).y;
  const chinY     = pt(faceCenterX, faceTop + faceH).y;

  // ── Jaw ───────────────────────────────────────────────────────────────────
  const jawY    = mouthY + (chinY - mouthY) * 0.55;
  const rawLEar = lm?.LEFT_EAR
    ? { x: lm.LEFT_EAR.x * imgW, y: lm.LEFT_EAR.y * imgH }
    : { x: faceLeft + faceW * 0.10, y: faceTop + faceH * 0.50 };
  const rawREar = lm?.RIGHT_EAR
    ? { x: lm.RIGHT_EAR.x * imgW, y: lm.RIGHT_EAR.y * imgH }
    : { x: faceLeft + faceW * 0.90, y: faceTop + faceH * 0.50 };
  const lEar      = pt(rawLEar.x, rawLEar.y);
  const rEar      = pt(rawREar.x, rawREar.y);
  const leftJawX  = Math.min(lEar.x, rEar.x);
  const rightJawX = Math.max(lEar.x, rEar.x);

  // ── Cheeks (zygomatic) ────────────────────────────────────────────────────
  const rawLC = lm?.LEFT_CHEEK
    ? { x: lm.LEFT_CHEEK.x * imgW, y: lm.LEFT_CHEEK.y * imgH }
    : { x: faceLeft + faceW * 0.18, y: faceTop + faceH * 0.52 };
  const rawRC = lm?.RIGHT_CHEEK
    ? { x: lm.RIGHT_CHEEK.x * imgW, y: lm.RIGHT_CHEEK.y * imgH }
    : { x: faceLeft + faceW * 0.82, y: faceTop + faceH * 0.52 };
  const lc         = pt(rawLC.x, rawLC.y);
  const rc         = pt(rawRC.x, rawRC.y);
  const zygoLeftX  = Math.min(lc.x, rc.x);
  const zygoRightX = Math.max(lc.x, rc.x);
  const zygoY      = (lc.y + rc.y) / 2;

  // ── Neck ──────────────────────────────────────────────────────────────────
  const neckY     = chinY + len(faceH * 0.10);
  const neckHalfW = (mouthRightX - mouthLeftX) * 0.8;

  return {
    cx, leX, reX, eyeY, noseBridgeY, noseTipY,
    noseLeftX:  cx - noseHalfW,
    noseRightX: cx + noseHalfW,
    mouthY, mouthLeftX, mouthRightX,
    jawY, leftJawX, rightJawX, chinY, foreheadY,
    zygoLeftX, zygoRightX, zygoY,
    neckLeftX:  cx - neckHalfW,
    neckRightX: cx + neckHalfW,
    neckY,
  };
}
