import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { COLORS, FONTS } from '../../lib/constants';

const { width: SCREEN_W } = Dimensions.get('window');
const H_MARGIN = 20;
const CONTAINER_W = SCREEN_W - H_MARGIN * 2;
const BAR_H = 3;
const THUMB_SIZE = 22;
const START_DOT = 8;

interface ScanProgressBarProps {
  progress: SharedValue<number>; // 0-1
}

export default function ScanProgressBar({ progress }: ScanProgressBarProps) {
  const BAR_W = CONTAINER_W - THUMB_SIZE; // track width, leaving room for thumb

  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(0, progress.value * BAR_W),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: Math.max(0, Math.min(progress.value * BAR_W, BAR_W - THUMB_SIZE + THUMB_SIZE / 2)),
  }));

  return (
    <View style={styles.wrapper}>
      {/* Label pill */}
      <View style={styles.labelPill}>
        <Text style={styles.label}>PSL  PROGRESS</Text>
      </View>

      {/* Progress bar row */}
      <View style={styles.barRow}>
        {/* Start dot */}
        <View style={styles.startDot} />

        {/* Track + fill */}
        <View style={[styles.trackContainer, { width: BAR_W }]}>
          <View style={styles.track} />
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>

        {/* Thumb — floats above bar */}
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 52,
    left: H_MARGIN,
    right: H_MARGIN,
    zIndex: 10,
    backgroundColor: 'rgba(8,10,12,0.72)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: THUMB_SIZE / 2,
    alignItems: 'center',
  },
  labelPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 12,
  },
  label: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 3,
    textAlign: 'center',
  },
  barRow: {
    width: '100%',
    height: THUMB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  startDot: {
    position: 'absolute',
    left: 0,
    width: START_DOT,
    height: START_DOT,
    borderRadius: START_DOT / 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    zIndex: 2,
  },
  trackContainer: {
    height: BAR_H,
    justifyContent: 'center',
    marginLeft: START_DOT / 2,
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    backgroundColor: COLORS.TEXT_PRIMARY,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.TEXT_PRIMARY,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
});
