import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS, FONTS } from '../../lib/constants';
import { MetricScore } from '../../types';

interface Props {
  title: string;
  metrics: MetricScore[];
  overallScore: number;
  locked: boolean;
}

function LockIcon({ open }: { open: boolean }) {
  return (
    <View style={styles.lockBadge}>
      <Text style={styles.lockIcon}>{open ? '🔓' : '🔒'}</Text>
    </View>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(Math.max((score / 10) * 100, 0), 100);
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%` }]} />
    </View>
  );
}

export default function ResultCard({ title, metrics, overallScore, locked }: Props) {
  if (locked) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
        <LockIcon open={false} />
        <View style={styles.lockedContent}>
          <Text style={styles.lockLargeIcon}>🔒</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.lockedLabel}>ĐÃ KHÓA</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      <LockIcon open />

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.scoreText}>{overallScore.toFixed(1)}/10</Text>
      <ScoreBar score={overallScore} />

      <View style={styles.metricsList}>
        {metrics.map((m) => (
          <View key={m.name} style={styles.metricRow}>
            <View style={styles.metricInfo}>
              <Text style={styles.metricName}>{m.name}</Text>
              <Text style={styles.metricSub}>{m.subtitle}</Text>
            </View>
            <Text style={styles.metricScore}>{m.score.toFixed(1)}</Text>
          </View>
        ))}
      </View>

      {metrics.some((m) => m.tips.length > 0) && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>MẸO CẢI THIỆN</Text>
          {metrics
            .flatMap((m) => m.tips)
            .slice(0, 3)
            .map((tip, i) => (
              <Text key={i} style={styles.tipText}>• {tip}</Text>
            ))}
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
  },
  lockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  lockIcon: {
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
    marginBottom: 12,
  },
  scoreText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 36,
    color: COLORS.ACCENT_GOLD,
    marginBottom: 8,
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: 2,
  },
  metricsList: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricSub: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
    marginTop: 2,
  },
  metricScore: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.ACCENT_GOLD,
    marginLeft: 12,
  },
  tipsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tipsTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 12,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tipText: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 4,
  },
});
