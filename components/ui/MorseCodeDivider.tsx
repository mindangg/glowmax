import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function MorseCodeDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={styles.dash} />
      <View style={styles.dot} />
      <View style={styles.dash} />
      <View style={[styles.dot, styles.centerDot]} />
      <View style={styles.dash} />
      <View style={styles.dot} />
      <View style={styles.dash} />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    gap: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666666',
  },
  dash: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666666',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
