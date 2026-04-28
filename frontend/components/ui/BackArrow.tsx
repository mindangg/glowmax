import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BackArrowProps {
  onPress?: () => void;
}

export default function BackArrow({ onPress }: BackArrowProps) {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={onPress ?? (() => router.back())} style={styles.container} hitSlop={16}>
      <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
  },
});
