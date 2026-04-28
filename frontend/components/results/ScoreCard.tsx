// ScoreCard — Card điểm của bạn
// Background: bxh-bg.png (eclipse ring at top for photo placement)
// 5 category icons: clean_1–5
// Used in: results carousel (own card) + user-score screen (any user)

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS, FONTS, getTierColor, PSL_TIER_ORDER } from '../../lib/constants';
import { PSLTier } from '../../types';

const BXH_BG   = require('../../assets/images/bxh-bg.png');
const CLEAN_1  = require('../../assets/images/clean_1.png'); // mắt
const CLEAN_2  = require('../../assets/images/clean_2.png'); // hàm
const CLEAN_3  = require('../../assets/images/clean_3.png'); // anh khí / appeal
const CLEAN_4  = require('../../assets/images/clean_4.png'); // mũi
const CLEAN_5  = require('../../assets/images/clean_5.png'); // tóc

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

interface CategoryRow {
  icon: any;
  label: string;
  score: number | undefined; // 0–10, displayed as ×10
}

const CATEGORIES: Array<Omit<CategoryRow, 'score'> & { key: string }> = [
  { key: 'eyes',   icon: CLEAN_1, label: 'MẮT' },
  { key: 'jaw',    icon: CLEAN_2, label: 'HÀM' },
  { key: 'appeal', icon: CLEAN_3, label: 'ANH KHÍ' },
  { key: 'nose',   icon: CLEAN_4, label: 'MŨI' },
  { key: 'hair',   icon: CLEAN_5, label: 'TÓC' },
];

export interface ScoreCardProps {
  username: string;
  photoUrl?: string;
  combinedScore: number;          // 0–100
  overallScore?: number;          // 0–10 (raw)
  pslTier?: string;
  potentialTier?: string;
  eyesScore?: number;             // 0–10
  jawScore?: number;
  appealScore?: number;
  noseScore?: number;
  hairScore?: number;
  showViewRankButton?: boolean;
  onViewRank?: () => void;
}

function getBarColor(score: number): string {
  if (score >= 7) return COLORS.ACCENT_GOLD;
  if (score >= 4) return '#D4845A';
  return '#E05555';
}

function CategoryRowItem({ icon, label, score }: CategoryRow) {
  const pct   = score != null ? Math.min(Math.max(score / 10, 0), 1) : 0;
  const disp  = score != null ? Math.round(score * 10) : '--';
  const color = score != null ? getBarColor(score) : 'rgba(255,255,255,0.2)';

  return (
    <View style={styles.catRow}>
      <Image source={icon} style={styles.catIcon} resizeMode="contain" />
      <Text style={styles.catLabel}>{label}</Text>
      <View style={styles.catBarTrack}>
        <View style={[styles.catBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.catScore}>{disp}</Text>
    </View>
  );
}

export default function ScoreCard({
  username,
  photoUrl,
  combinedScore,
  pslTier,
  potentialTier,
  eyesScore,
  jawScore,
  appealScore,
  noseScore,
  hairScore,
  showViewRankButton = false,
  onViewRank,
}: ScoreCardProps) {
  const initial    = username.charAt(0).toUpperCase();
  const tierColor  = pslTier ? getTierColor(pslTier as PSLTier) : COLORS.ACCENT_GOLD;
  const tierIndex  = pslTier ? PSL_TIER_ORDER.indexOf(pslTier as PSLTier) : -1;
  const tierPct    = tierIndex >= 0 ? ((tierIndex + 1) / 7) * 100 : 0;
  const combinedPct = Math.min(Math.max(combinedScore / 100, 0), 1) * 100;

  const catScores: Record<string, number | undefined> = {
    eyes:   eyesScore,
    jaw:    jawScore,
    appeal: appealScore,
    nose:   noseScore,
    hair:   hairScore,
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      {/* Background image */}
      <Image source={BXH_BG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      {/* Dark overlay for readability */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Username */}
        <Text style={styles.username} numberOfLines={1}>{username.toUpperCase()}</Text>

        {/* Avatar — sits over the eclipse ring in bxh-bg.png */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Scores row — Tổng thể + Tiềm năng */}
        <View style={styles.scoresRow}>
          {/* Tổng thể */}
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>TỔNG THỂ</Text>
            <Text style={styles.scoreBig}>{Math.round(combinedScore)}</Text>
            <View style={styles.scoreBarTrack}>
              <View
                style={[
                  styles.scoreBarFill,
                  { width: `${combinedPct}%`, backgroundColor: COLORS.ACCENT_GOLD },
                ]}
              />
            </View>
          </View>

          {/* Tiềm năng */}
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>TIỀM NĂNG</Text>
            <Text style={[styles.potentialTier, { color: tierColor }]}>
              {potentialTier ?? pslTier ?? '—'}
            </Text>
            <View style={styles.scoreBarTrack}>
              <View
                style={[
                  styles.scoreBarFill,
                  { width: `${tierPct}%`, backgroundColor: tierColor },
                ]}
              />
            </View>
          </View>
        </View>

        {/* 5 category rows */}
        <View style={styles.catList}>
          {CATEGORIES.map((cat) => (
            <CategoryRowItem
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              score={catScores[cat.key]}
            />
          ))}
        </View>

        {/* TIER badge */}
        {pslTier && (
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { borderColor: tierColor }]}>
              <Text style={styles.badgeTop}>TIER</Text>
              <Text style={[styles.badgeValue, { color: tierColor }]}>
                {pslTier.toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* XEM RANK CỦA BẠN */}
        {showViewRankButton && onViewRank && (
          <TouchableOpacity style={styles.rankBtn} onPress={onViewRank} activeOpacity={0.75}>
            <Text style={styles.rankBtnText}>XEM RANK CỦA BẠN →</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(232,197,111,0.20)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,5,0,0.55)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },

  // Username
  username: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 10,
  },

  // Avatar
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: COLORS.ACCENT_GOLD,
    overflow: 'hidden',
    shadowColor: COLORS.ACCENT_GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(232,197,111,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 36,
    color: COLORS.ACCENT_GOLD,
  },

  // Scores row
  scoresRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  scoreBlock: {
    flex: 1,
  },
  scoreLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  scoreBig: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 32,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    lineHeight: 36,
    marginBottom: 6,
  },
  potentialTier: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    letterSpacing: 1,
    lineHeight: 24,
    marginBottom: 6,
    marginTop: 4,
  },
  scoreBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Category rows
  catList: {
    gap: 2,
    marginBottom: 12,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 8,
  },
  catIcon: {
    width: 26,
    height: 26,
  },
  catLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    width: 72,
  },
  catBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  catScore: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
    width: 28,
    textAlign: 'right',
    letterSpacing: 0.5,
  },

  // Tier badge
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badgeTop: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  badgeValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    letterSpacing: 1.5,
  },

  // XEM RANK button
  rankBtn: {
    backgroundColor: 'rgba(232,197,111,0.15)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(232,197,111,0.4)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  rankBtnText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 12,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 2,
  },
});
