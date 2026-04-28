import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../lib/constants';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'gold';
}

export default function FrostedButton({ label, onPress, disabled, variant = 'default' }: Props) {
  if (variant === 'gold') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8} style={styles.wrapper}>
        <LinearGradient
          colors={[COLORS.BUTTON_GRADIENT_START, COLORS.BUTTON_GRADIENT_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, disabled && styles.disabled]}
        >
          <Text style={[styles.label, { color: '#1A1A1A' }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.wrapper, styles.button, styles.defaultBg, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 24,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultBg: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.4,
  },
});
