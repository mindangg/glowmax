import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS, FONTS } from '../../lib/constants';

interface Props {
  score: number | null;
  rank: number | null;
  totalUsers: number | null;
  locked: boolean;
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(Math.max((score / 10) * 100, 0), 100);
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%` }]} />
    </View>
  );
}

export default function AppealCard({ score, rank, totalUsers, locked }: Props) {
  if (locked) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
        <View style={styles.lockBadge}>
          <Text style={styles.lockIconText}>🔒</Text>
        </View>
        <View style={styles.lockedContent}>
          <Text style={styles.lockLargeIcon}>🔒</Text>
          <Text style={styles.title}>APPEAL</Text>
          <Text style={styles.lockedLabel}>ĐÃ KHÓA</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      <View style={styles.lockBadge}>
        <Text style={styles.lockIconText}>🔓</Text>
      </View>

      <Text style={styles.title}>APPEAL</Text>
      <Text style={styles.subtitle}>OVERALL FACE SCORE</Text>

      <Text style={styles.scoreDisplay}>
        {score != null ? score.toFixed(1) : '—'}/10
      </Text>

      {score != null && <ScoreBar score={score} />}

      {rank != null && totalUsers != null && (
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>
            BẠN ĐANG HẠNG {rank}/{totalUsers}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.BACKGROUND_ELEVATED,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 320,
    alignItems: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  lockIconText: {
    fontSize: 18,
  },
  lockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  lockLargeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockedLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
    marginTop: 8,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 22,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
    marginBottom: 20,
  },
  scoreDisplay: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 48,
    color: COLORS.ACCENT_GOLD,
    marginBottom: 12,
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    width: '100%',
    marginBottom: 20,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: 2,
  },
  rankContainer: {
    backgroundColor: 'rgba(232,197,111,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,197,111,0.2)',
  },
  rankText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
  },
});
