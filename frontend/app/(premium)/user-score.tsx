// User Score Screen — card điểm chi tiết
// Background: BxhBackground (bxh_bg.png — dark texture, golden light streaks)
// Layout: theo ảnh tham khảo
// Back → daily tab

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Share,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import BxhBackground from '../../components/backgrounds/BxhBackground';
import { COLORS, FONTS, getTierColor, PSL_TIER_ORDER } from '../../lib/constants';
import { LeaderboardEntry, PSLTier } from '../../types';

// ── Assets ────────────────────────────────────────────────────────────────────
const CLEAN_1 = require('../../assets/images/clean_1.png'); // mắt
const CLEAN_2 = require('../../assets/images/clean_2.png'); // hàm
const CLEAN_3 = require('../../assets/images/clean_3.png'); // anh khí
const CLEAN_4 = require('../../assets/images/clean_4.png'); // mũi
const CLEAN_5 = require('../../assets/images/clean_5.png'); // tóc

const { width: W, height: H } = Dimensions.get('window');

const AVATAR_SIZE = Math.round(W * 0.42);

// Danh sách hạng mục (thứ tự theo ảnh tham khảo)
const CATEGORIES = [
  { key: 'appeal', icon: CLEAN_3, label: 'APPEAL' },
  { key: 'jaw',    icon: CLEAN_2, label: 'HÀM' },
  { key: 'eyes',   icon: CLEAN_1, label: 'MẮT' },
  { key: 'hair',   icon: CLEAN_5, label: 'TÓC' },
  { key: 'nose',   icon: CLEAN_4, label: 'MŨI' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function tierToScore(tier: string): number {
  const idx = PSL_TIER_ORDER.indexOf(tier as PSLTier);
  if (idx < 0) return 0;
  return Math.round((idx + 1) / 7 * 99);
}

function normalizeScore(score: number): number {
  return score > 10 ? score / 10 : score;
}

function catBarColor(norm: number): string {
  if (norm >= 7) return COLORS.ACCENT_GOLD;
  if (norm >= 4) return '#D4845A';
  return '#E05555';
}

// ── Sub-component: Progress Bar ───────────────────────────────────────────────

interface BarProps {
  pct: number;
  colors: [string, string, ...string[]];
}

function GradientBar({ pct, colors }: BarProps) {
  return (
    <View style={bar.track}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[bar.fill, { width: `${Math.min(Math.max(pct, 0), 1) * 100}%` }]}
      />
    </View>
  );
}

const bar = StyleSheet.create({
  track: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
});

// ── Sub-component: Category Row ───────────────────────────────────────────────

interface CatRowProps {
  icon: any;
  label: string;
  score: number | undefined;
}

function CatRow({ icon, label, score }: CatRowProps) {
  const norm  = score != null ? normalizeScore(score) : null;
  const pct   = norm != null ? Math.min(Math.max(norm / 10, 0), 1) : 0;
  const disp  = norm != null ? Math.round(norm * 10) : '--';
  const color = norm != null ? catBarColor(norm) : 'rgba(255,255,255,0.15)';

  return (
    <View style={row.wrap}>
      <Image source={icon} style={row.icon} resizeMode="contain" />
      <Text style={row.label}>{label}</Text>
      <View style={row.barTrack}>
        <View style={[row.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={row.score}>{disp}</Text>
    </View>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
    width: 72,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  score: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    width: 28,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function UserScoreScreen() {
  const router = useRouter();
  const { entry: entryStr } = useLocalSearchParams<{ entry: string }>();
  const shotRef = useRef<ViewShot>(null);

  let entry: LeaderboardEntry | null = null;
  try { entry = JSON.parse(entryStr ?? ''); } catch { /* invalid */ }

  const handleBack = () => router.replace('/(premium)/daily');

  const handleShare = async () => {
    try {
      const uri = await captureRef(shotRef, { format: 'png', quality: 0.95 });

      // Save to camera roll first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
      }

      // Then open share sheet
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Chia sẻ card điểm' });
      }
    } catch {
      if (!entry) return;
      await Share.share({
        message: `${entry.username.toUpperCase()} — ${Math.round(entry.combined_score)} ĐIỂM | ${entry.psl_tier?.toUpperCase() ?? ''} | Glowmax`,
      });
    }
  };

  // ── Error state ─────────────────────────────────────────────────────────────
  if (!entry) {
    return (
      <BxhBackground>
        <View style={s.errWrap}>
          <Text style={s.errText}>Không tìm thấy dữ liệu.</Text>
          <TouchableOpacity onPress={handleBack} style={s.errBtn}>
            <Text style={s.errBtnText}>QUAY LẠI</Text>
          </TouchableOpacity>
        </View>
      </BxhBackground>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────────
  const tierColor      = getTierColor((entry.psl_tier ?? 'HTN') as PSLTier);
  const potentialColor = getTierColor((entry.potential_tier ?? entry.psl_tier ?? 'HTN') as PSLTier);
  const overallScore   = Math.round(entry.combined_score);
  const potentialScore = tierToScore(entry.potential_tier ?? entry.psl_tier ?? '');
  const overallPct     = overallScore / 100;
  const potentialPct   = potentialScore / 99;
  const initial        = entry.username.charAt(0).toUpperCase();

  const catScores: Record<string, number | undefined> = {
    appeal: entry.appeal_score,
    jaw:    entry.jaw_score,
    eyes:   entry.eyes_score,
    hair:   entry.hair_score,
    nose:   entry.nose_score,
  };

  return (
    <BxhBackground>
      <ViewShot ref={shotRef} style={{ flex: 1 }} options={{ format: 'png', quality: 0.95 }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <View style={s.screen}>

          {/* ── Header ────────────────────────────────────────────────────── */}
          <View style={s.header}>
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={s.closeBtn}
            >
              <Ionicons name="close" size={18} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <Text style={s.username} numberOfLines={1}>
              {entry.username.toUpperCase()}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          {/* ── Top block: avatar + scores + categories ────────────────────── */}
          <View style={s.topBlock}>

            {/* Avatar — 2 lớp shadow lồng nhau */}
            <View style={[s.avatarOuterGlow, { shadowColor: tierColor }]}>
              <View style={[s.avatarInnerGlow, { shadowColor: tierColor }]}>
                <View style={[s.avatarRing, { borderColor: tierColor }]}>
                  {entry.photo_url ? (
                    <Image source={{ uri: entry.photo_url }} style={s.avatarImg} resizeMode="cover" />
                  ) : (
                    <View style={s.avatarFallback}>
                      <Text style={[s.avatarInitial, { color: tierColor }]}>{initial}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Scores: Overall | Potential */}
            <View style={s.scoresRow}>
              <View style={s.scoreCol}>
                <Text style={s.scoreLabel}>TỔNG THỂ</Text>
                <Text style={s.scoreNum}>{overallScore}</Text>
                <GradientBar pct={overallPct} colors={['#F0D080', COLORS.ACCENT_GOLD, '#C9963A']} />
              </View>
              <View style={s.scoreCol}>
                <Text style={s.scoreLabel}>TIỀM NĂNG</Text>
                <Text style={[s.scoreNum, { color: potentialColor }]}>{potentialScore}</Text>
                <GradientBar pct={potentialPct} colors={['#A8E063', '#56AB2F']} />
              </View>
            </View>

            {/* Divider */}
            <View style={s.divider} />

            {/* Category rows */}
            <View style={s.catList}>
              {CATEGORIES.map((cat) => (
                <CatRow key={cat.key} icon={cat.icon} label={cat.label} score={catScores[cat.key]} />
              ))}
            </View>
          </View>

          {/* ── Bottom block: TIER/LOẠI + share ───────────────────────────── */}
          <View style={s.bottomBlock}>
            <View style={s.boxRow}>
              <View style={[s.infoBox, { borderColor: tierColor, shadowColor: tierColor }]}>
                <Text style={s.boxLabel}>TIER</Text>
                <Text style={[s.boxValue, { color: tierColor }]}>
                  {(entry.psl_tier ?? '—').toUpperCase()}
                </Text>
              </View>
              <View style={[s.infoBox, { borderColor: COLORS.ACCENT_GOLD, shadowColor: COLORS.ACCENT_GOLD }]}>
                <Text style={s.boxLabel}>LOẠI</Text>
                <Text style={[s.boxValue, { color: COLORS.ACCENT_GOLD }]}>
                  {entry.style_type ?? '—'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.75}>
              <Text style={s.shareBtnText}>CHIA SẺ ĐIỂM CỦA TÔI 🔥</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ViewShot>
    </BxhBackground>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 50,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 4,
    flex: 1,
    textAlign: 'center',
  },

  // Top block
  topBlock: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 4,
  },

  // Avatar — 2 lớp shadow (shadowColor set inline)
  avatarOuterGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.60,
    shadowRadius: 38,
    borderRadius: AVATAR_SIZE / 2,
    elevation: 22,
    marginBottom: 14,
  },
  avatarInnerGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 12,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  avatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    backgroundColor: 'rgba(232,197,111,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: AVATAR_SIZE * 0.32,
  },

  // Scores
  scoresRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 20,
    marginBottom: 12,
  },
  scoreCol: {
    flex: 1,
    gap: 5,
  },
  scoreLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
  },
  scoreNum: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 48,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -1,
    lineHeight: 54,
  },

  // Divider
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },

  // Categories
  catList: {
    width: '100%',
  },

  // Bottom block
  bottomBlock: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 10,
  },
  boxRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: 'rgba(8,5,2,0.55)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 9,
    elevation: 8,
  },
  boxLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
    marginBottom: 3,
  },
  boxValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    letterSpacing: 1.5,
  },
  shareBtn: {
    backgroundColor: 'rgba(8,5,2,0.60)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,111,0.30)',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.ACCENT_GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 12,
    elevation: 8,
  },
  shareBtnText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 2,
  },

  // Error
  errWrap:    { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  errText:    { fontFamily: FONTS.MONO, fontSize: 14, color: COLORS.TEXT_SECONDARY, letterSpacing: 1 },
  errBtn:     { paddingVertical: 12, paddingHorizontal: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 50 },
  errBtnText: { fontFamily: FONTS.MONO_BOLD, fontSize: 12, color: COLORS.TEXT_PRIMARY, letterSpacing: 2 },
});
