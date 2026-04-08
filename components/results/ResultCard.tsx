import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, getBarColor } from '../../lib/constants';
import { MetricScore, ResultCategory } from '../../types';

const FACE_THUMB = require('../../assets/images/face.png');

interface Props {
  title: string;
  metrics: MetricScore[];
  overallScore: number;
  locked: boolean;
  category: ResultCategory;
}

function getDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Special locked card for Ascension
function AscensionLockedCard() {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.specialCard}>
      <LinearGradient
        colors={['#C4B5F4', '#A8D8C2', '#B8D4F0', '#F0B8D4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.specialGradient}
      >
        {/* Header area */}
        <View style={styles.specialHeader}>
          <Text style={styles.specialTitle}>YOUR ASCENSION PLAN</Text>
          <View style={styles.specialPill}>
            <Text style={styles.specialPillText}>PRIORITY 1</Text>
          </View>
        </View>

        {/* Blurred body */}
        <BlurView intensity={80} tint="dark" style={styles.specialBlurBody} />
      </LinearGradient>
    </Animated.View>
  );
}

// Special locked card for Leanmax
function LeanmaxLockedCard() {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.specialCard}>
      <LinearGradient
        colors={['#1A2A6C', '#2E5BB8', '#4A8FD4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.specialGradient}
      >
        {/* Header area */}
        <View style={styles.specialHeaderBlue}>
          <Text style={styles.specialTitle}>LEANMAX PROTOCOL</Text>
          <View style={styles.specialPillBlue}>
            <Text style={styles.specialPillTextSmall}>THE OPTIMIZED, EFFICIENT ROUTINE</Text>
          </View>
        </View>

        {/* Day tag + blur */}
        <View style={styles.leanmaxBody}>
          <View style={styles.dayPill}>
            <Text style={styles.dayPillText}>DAY 2 – DELTS & ARMS</Text>
          </View>
          <BlurView intensity={80} tint="dark" style={styles.specialBlurBodyLean} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// Metric value display for unlocked cards
function MetricValue({ metric }: { metric: MetricScore }) {
  // Special: FACIAL THIRDS has 3 values encoded as measurement
  if (metric.name === 'FACIAL THIRDS') {
    return (
      <View style={styles.metricValueCol}>
        <Text style={styles.metricValueText}>0.24</Text>
        <Text style={styles.metricValueText}>0.41</Text>
        <Text style={styles.metricValueText}>0.35</Text>
        <Text style={styles.idealRangeText}>IDEAL RANGE: 0.33 EACH</Text>
      </View>
    );
  }

  if (metric.displayLabel) {
    return (
      <View style={styles.metricValueCol}>
        <Text style={styles.metricValueText}>{metric.displayLabel}</Text>
      </View>
    );
  }

  if (metric.measurement != null && metric.unit != null) {
    const formatted =
      metric.unit === '%'
        ? `${Math.round(metric.measurement)}${metric.unit}`
        : `${metric.measurement.toFixed(2)}${metric.unit}`;
    return (
      <View style={styles.metricValueCol}>
        <Text style={styles.metricValueText}>{formatted}</Text>
        {metric.idealRange ? (
          <Text style={styles.idealRangeText}>IDEAL RANGE: {metric.idealRange}</Text>
        ) : null}
      </View>
    );
  }

  // Fallback: just show score
  return (
    <View style={styles.metricValueCol}>
      <Text style={styles.metricValueText}>{metric.score.toFixed(2)}</Text>
      {metric.idealRange ? (
        <Text style={styles.idealRangeText}>IDEAL RANGE: {metric.idealRange}</Text>
      ) : null}
    </View>
  );
}

export default function ResultCard({ title, metrics, overallScore, locked, category }: Props) {
  const dateStr = getDate();

  // Special locked cards for ascension and leanmax
  if (locked && category === 'ascension') return <AscensionLockedCard />;
  if (locked && category === 'leanmax') return <LeanmaxLockedCard />;

  if (locked) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.cardLocked}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.35)" />
        </View>
        <Text style={styles.dateText}>{dateStr}</Text>

        {/* Gray unfilled bar */}
        <View style={styles.barTrackLocked} />

        {/* Metric rows — names visible, values locked */}
        <ScrollView
          style={styles.metricsList}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {metrics.map((m) => (
            <View key={m.name} style={styles.metricRow}>
              <Image source={FACE_THUMB} style={styles.metricThumb} resizeMode="cover" />
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>{m.name}</Text>
                {m.subtitle ? (
                  <Text style={styles.metricSub}>{m.subtitle.toUpperCase()}</Text>
                ) : null}
              </View>
              <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.25)" />
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  }

  // Unlocked state
  const scoreInt = Math.round(overallScore);
  const barColor = getBarColor(overallScore);
  const barPct = Math.min(Math.max((overallScore / 10) * 100, 0), 100);

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.scoreLarge}>{scoreInt}</Text>
      </View>
      <Text style={styles.dateText}>{dateStr}</Text>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${barPct}%`, backgroundColor: barColor }]} />
      </View>

      {/* Metric rows */}
      <ScrollView
        style={styles.metricsList}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {metrics.map((m) => (
          <View key={m.name} style={styles.metricRow}>
            <Image source={FACE_THUMB} style={styles.metricThumb} resizeMode="cover" />
            <View style={styles.metricInfo}>
              <Text style={styles.metricName}>{m.name}</Text>
              {m.subtitle ? (
                <Text style={styles.metricSub}>{m.subtitle.toUpperCase()}</Text>
              ) : null}
            </View>
            <MetricValue metric={m} />
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // --- Unlocked card ---
  card: {
    backgroundColor: 'rgba(28,18,2,0.88)',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,200,80,0.12)',
  },

  // --- Locked card ---
  cardLocked: {
    backgroundColor: 'rgba(15,15,18,0.92)',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  // Header
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

  // Progress bar unlocked
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3,
    marginBottom: 18,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Progress bar locked (gray, no fill)
  barTrackLocked: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 18,
  },

  // Metrics
  metricsList: {
    maxHeight: 320,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  metricThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
    marginTop: 2,
  },

  // Metric value (right side)
  metricValueCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
    flexShrink: 0,
  },
  metricValueText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    textAlign: 'right',
  },
  idealRangeText: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'right',
  },

  // --- Special cards (Ascension / Leanmax locked) ---
  specialCard: {
    borderRadius: 18,
    overflow: 'hidden',
    minHeight: 320,
  },
  specialGradient: {
    flex: 1,
    minHeight: 320,
  },
  specialHeader: {
    backgroundColor: 'rgba(100,100,120,0.3)',
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  specialHeaderBlue: {
    backgroundColor: 'rgba(20,30,80,0.5)',
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  specialTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 12,
  },
  specialPill: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  specialPillText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 11,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  specialPillBlue: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  specialPillTextSmall: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 10,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  specialBlurBody: {
    flex: 1,
    minHeight: 200,
  },
  leanmaxBody: {
    flex: 1,
  },
  dayPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    zIndex: 1,
  },
  dayPillText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 11,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  specialBlurBodyLean: {
    flex: 1,
    minHeight: 160,
  },
});
