import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, getBarColor } from '../../lib/constants';

interface Props {
  score: number | null;
  locked: boolean;
}

function getDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AppealCard({ score, locked }: Props) {
  const dateStr = getDate();

  if (locked) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.cardLocked}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>APPEAL</Text>
          <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.35)" />
        </View>
        <Text style={styles.dateText}>{dateStr}</Text>
        <View style={styles.barTrack} />

        {/* Large center lock icon */}
        <View style={styles.lockedCenter}>
          <Ionicons name="lock-closed" size={48} color="rgba(255,255,255,0.25)" />
        </View>
      </Animated.View>
    );
  }

  const scoreInt = score != null ? Math.round(score) : 0;
  const barColor = score != null ? getBarColor(score) : COLORS.ACCENT_GOLD;
  const barPct = score != null ? Math.min(Math.max((score / 10) * 100, 0), 100) : 0;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>APPEAL</Text>
        <Text style={styles.scoreLarge}>{scoreInt}</Text>
      </View>
      <Text style={styles.dateText}>{dateStr}</Text>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${barPct}%`, backgroundColor: barColor }]} />
      </View>

      {/* Description */}
      <Text style={styles.whatIsTitle}>WHAT IS APPEAL?</Text>
      <Text style={styles.description}>
        UNLIKE PSL (BASED ON PURE NUMBERS), APPEAL IS THE SUBCONSCIOUS, HOLISTIC IMPRESSION OF
        FACIAL AESTHETICS & HEALTH BEYOND OBJECTIVE STRUCTURE.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(28,18,2,0.88)',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,200,80,0.12)',
  },
  cardLocked: {
    backgroundColor: 'rgba(15,15,18,0.92)',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    flex: 1,
  },
  scoreLarge: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    marginLeft: 12,
  },
  dateText: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Unlocked description
  whatIsTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 18,
    alignSelf: 'center',
    maxWidth: '85%',
  },

  // Locked center
  lockedCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});
