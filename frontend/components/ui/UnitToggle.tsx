import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../lib/constants';

interface Props {
  value: 'imperial' | 'metric';
  onChange: (value: 'imperial' | 'metric') => void;
}

export default function UnitToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onChange('imperial')}
        style={[styles.segment, value === 'imperial' && styles.segmentActive]}
      >
        <Text style={[styles.label, value === 'imperial' && styles.labelActive]}>IMPERIAL</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange('metric')}
        style={[styles.segment, value === 'metric' && styles.segmentActive]}
      >
        <Text style={[styles.label, value === 'metric' && styles.labelActive]}>METRIC</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  segment: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelActive: {
    color: '#1A1A1A',
  },
});
