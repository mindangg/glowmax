import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../lib/constants';

interface Props {
  name: string;
  subtitle?: string;
  score?: number;
  locked: boolean;
}

export default function MetricRow({ name, subtitle, score, locked }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {locked ? (
        <Text style={styles.lockIcon}>🔒</Text>
      ) : (
        <Text style={styles.score}>{score != null ? score.toFixed(1) : '—'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
    marginTop: 2,
  },
  score: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.ACCENT_GOLD,
    marginLeft: 12,
  },
  lockIcon: {
    fontSize: 16,
    marginLeft: 12,
  },
});
