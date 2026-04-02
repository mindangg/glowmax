import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, getTierColor, getTierProgress } from '../../lib/constants';
import { PSLTier } from '../../types';

interface PSLCardProps {
  pslTier?: PSLTier;
  potentialTier?: PSLTier;
  date?: string;
  locked?: boolean;
}

function TierBar({ tier }: { tier: PSLTier }) {
  const color = getTierColor(tier);
  const pct = getTierProgress(tier) * 100;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

function getDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PSLCard({ pslTier, potentialTier, date, locked }: PSLCardProps) {
  const dateStr = date ?? getDate();

  if (locked) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.cardLocked}>
        {/* PSL Section */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>PSL</Text>
            <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.35)" />
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
          <View style={styles.barTrackLocked} />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Potential Section */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>POTENTIAL</Text>
            <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.35)" />
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
          <View style={styles.barTrackLocked} />
        </View>
      </Animated.View>
    );
  }

  const pslColor = getTierColor(pslTier ?? 'LTN');
  const potentialColor = getTierColor(potentialTier ?? 'HTN');
  const isTrueChang = potentialTier === 'True Chang';

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      {/* PSL Section */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>PSL</Text>
          <Text style={[styles.tierLabel, { color: pslColor }]}>{(pslTier ?? 'LTN').toUpperCase()}</Text>
        </View>
        <Text style={styles.dateText}>{dateStr}</Text>
        <TierBar tier={pslTier ?? 'LTN'} />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Potential Section */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>POTENTIAL</Text>
          <Text
            style={[
              styles.tierLabel,
              { color: potentialColor },
              isTrueChang && styles.trueChangGlow,
            ]}
          >
            {(potentialTier ?? 'HTN').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.dateText}>{dateStr}</Text>
        <TierBar tier={potentialTier ?? 'HTN'} />
      </View>
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
  section: {},
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
  },
  tierLabel: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    letterSpacing: 1,
    marginLeft: 12,
  },
  trueChangGlow: {
    textShadowColor: '#F5E6C0',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barTrackLocked: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },
});
