import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { COLORS, FONTS } from '../../lib/constants';

const { width: SCREEN_W } = Dimensions.get('window');
const CONTAINER_H_MARGIN = 24;
const CONTAINER_W = SCREEN_W - CONTAINER_H_MARGIN * 2;
const BAR_H = 6;
const THUMB_SIZE = 24;
const BAR_H_PAD = 16;
const BAR_W = CONTAINER_W - BAR_H_PAD * 2;

interface ScanProgressBarProps {
  progress: SharedValue<number>; // 0-1
}

export default function ScanProgressBar({ progress }: ScanProgressBarProps) {
  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(0, progress.value * BAR_W),
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* PSL PROGRESS label pill */}
        <View style={styles.labelPill}>
          <Text style={styles.label}>PSL  PROGRESS</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.barArea}>
          {/* Track background */}
          <View style={styles.track} />
          {/* Animated fill */}
          <Animated.View style={[styles.fill, fillStyle]} />
          {/* Static thumb — fixed at right end of track (per reference frames) */}
          <View style={styles.thumb} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 50,
    left: CONTAINER_H_MARGIN,
    right: CONTAINER_H_MARGIN,
    zIndex: 10,
  },
  container: {
    backgroundColor: 'rgba(10,12,14,0.65)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: BAR_H_PAD,
    alignItems: 'center',
  },
  labelPill: {
    backgroundColor: 'rgba(30,34,38,0.9)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 10,
  },
  label: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 3,
    textAlign: 'center',
  },
  barArea: {
    width: BAR_W,
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    width: BAR_W,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  fill: {
    position: 'absolute',
    height: BAR_H,
    borderRadius: BAR_H / 2,
    backgroundColor: COLORS.TEXT_PRIMARY,
  },
  thumb: {
    position: 'absolute',
    right: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.TEXT_PRIMARY,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
});
