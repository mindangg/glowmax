import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { COLORS } from '../../lib/constants';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface GoldReferenceLineProps {
  yPosition: SharedValue<number>; // 0-1 fraction of screen height
}

export default function GoldReferenceLine({ yPosition }: GoldReferenceLineProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    top: yPosition.value * SCREEN_H,
  }));

  return (
    <Animated.View style={[styles.line, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.SCAN_GOLD_LINE,
    shadowColor: COLORS.SCAN_GOLD_LINE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 4,
  },
});
