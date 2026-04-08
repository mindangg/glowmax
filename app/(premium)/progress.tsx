// Premium Progress Tab — Tiến độ
// 3 stroke circles (days/overall/potential) + progress album
// Design: luxury minimal — gold ONLY on the large days circle stroke

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import { useTrialScan } from '../../hooks/useTrialScan';
import { useFullAnalysis } from '../../hooks/useFullAnalysis';
import { usePhotoCapture } from '../../hooks/usePhotoCapture';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, PSL_TIER_ORDER } from '../../lib/constants';
import { PSLTier } from '../../types';

const { width: SW } = Dimensions.get('window');
const PHOTO_COL_GAP = 12;
const PHOTO_SIZE = (SW - 48 - PHOTO_COL_GAP) / 2;

// ── Stroke circle ─────────────────────────────────────────────────────────────

type StrokeCircleProps = {
  size: number;
  strokeColor: string;
  strokeWidth?: number;
  children: React.ReactNode;
};

function StrokeCircle({ size, strokeColor, strokeWidth = 2, children }: StrokeCircleProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={cx} cy={cy} r={r} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      </Svg>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysRemaining(startDateMs: number | null): number {
  if (startDateMs === null) return 90;
  const daysSince = Math.floor((Date.now() - startDateMs) / (1000 * 60 * 60 * 24));
  return Math.max(0, 90 - daysSince);
}

function nextTier(current: PSLTier): PSLTier {
  const idx = PSL_TIER_ORDER.indexOf(current);
  if (idx === -1 || idx >= PSL_TIER_ORDER.length - 1) return PSL_TIER_ORDER[PSL_TIER_ORDER.length - 1];
  return PSL_TIER_ORDER[idx + 1];
}

function todayFormatted(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ProgressTab() {
  const { trialResult } = useTrialScan();
  const { results: fullResults } = useFullAnalysis();
  const { frontPhoto } = usePhotoCapture();

  // Score
  const fullScore = fullResults?.categories.find((c) => c.category === 'appeal')?.overallScore ?? null;
  const overallScore = fullScore ?? trialResult?.overall_score ?? null;
  const currentTier = fullResults?.pslResult?.psl_tier ?? null;
  const potentialTier = fullResults?.pslResult?.potential_tier ?? (currentTier ? nextTier(currentTier) : null);

  const potentialScore = useMemo(() => {
    if (overallScore === null) return null;
    return parseFloat(Math.min(10, overallScore * 1.15).toFixed(1));
  }, [overallScore]);

  // Days — if no scan yet, show full 90 days
  const daysRemaining = getDaysRemaining(trialResult ? Date.now() - 3 * 24 * 60 * 60 * 1000 : null);

  // Progress photos: show current scan photo if available
  const hasPhoto = !!frontPhoto;

  return (
    <TrailBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>TIẾN ĐỘ</Text>
        </Animated.View>

        {/* Stats card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsCard}>
          {/* Large circle — gold stroke */}
          <StrokeCircle size={168} strokeColor={COLORS.ACCENT_GOLD} strokeWidth={2}>
            <Text style={styles.daysNumber}>{daysRemaining}</Text>
            <Text style={styles.daysLabel}>NGÀY</Text>
            <Text style={styles.daysSubLabel}>CHO ĐẾN KHI BẠN ASCEND</Text>
          </StrokeCircle>

          {/* Two smaller circles — white stroke */}
          <View style={styles.smallRow}>
            <StrokeCircle size={112} strokeColor="rgba(255,255,255,0.25)" strokeWidth={1.5}>
              <Text style={styles.smallLabel}>TỔNG ĐIỂM</Text>
              <Text style={styles.smallValue}>
                {overallScore !== null ? overallScore.toFixed(1) : '—'}
              </Text>
              <Text style={styles.smallTier}>
                {currentTier ?? ''}
              </Text>
            </StrokeCircle>

            <StrokeCircle size={112} strokeColor="rgba(255,255,255,0.25)" strokeWidth={1.5}>
              <Text style={styles.smallLabel}>TIỀM NĂNG</Text>
              <Text style={styles.smallValue}>
                {potentialScore !== null ? potentialScore.toFixed(1) : '—'}
              </Text>
              <Text style={styles.smallTier}>
                {potentialTier ?? ''}
              </Text>
            </StrokeCircle>
          </View>
        </Animated.View>

        {/* Progress Album */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <Text style={styles.albumTitle}>Ảnh tiến trình</Text>

          {hasPhoto ? (
            <View style={styles.photoGrid}>
              <View style={styles.photoItem}>
                <Image
                  source={{ uri: frontPhoto! }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <View style={styles.photoOverlay}>
                  {overallScore !== null && (
                    <Text style={styles.photoScore}>{overallScore.toFixed(1)}</Text>
                  )}
                  <Text style={styles.photoDate}>{todayFormatted()}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyAlbum}>
              <Text style={styles.emptyTitle}>CHƯA CÓ ẢNH</Text>
              <Text style={styles.emptyBody}>
                Thực hiện quét để theo dõi sự thay đổi của bạn theo thời gian.
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 4,
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 28,
    gap: 20,
  },
  daysNumber: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 52,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 58,
  },
  daysLabel: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 3,
  },
  daysSubLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 7,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 110,
  },
  smallRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  smallLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 7,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  smallValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 30,
  },
  smallTier: {
    fontFamily: FONTS.MONO,
    fontSize: 8,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Album
  albumTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PHOTO_COL_GAP,
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE * 1.25,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  photoScore: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  photoDate: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
  },

  emptyAlbum: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    marginBottom: 10,
  },
  emptyBody: {
    fontFamily: 'System',
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: { height: 20 },
});
