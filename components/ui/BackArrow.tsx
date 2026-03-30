import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BackArrow() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.container} hitSlop={16}>
      <Text style={styles.arrow}>{'<'}</Text>
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
  arrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
});
