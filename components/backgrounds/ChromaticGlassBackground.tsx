import React, { ReactNode, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  children: ReactNode;
  iridescent?: boolean;
}

export default function ChromaticGlassBackground({ children, iridescent }: Props) {
  const spotlightOpacity = useSharedValue(0.04);

  useEffect(() => {
    spotlightOpacity.value = withRepeat(
      withTiming(0.09, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const spotlightStyle = useAnimatedStyle(() => ({
    opacity: spotlightOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0C0E', '#1A1E22', '#0A0C0E']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.spotlight, spotlightStyle]} />

      {iridescent && (
        <>
          <LinearGradient
            colors={['rgba(0,200,200,0.08)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.3, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.edgeHint]}
          />
          <LinearGradient
            colors={['rgba(180,0,255,0.06)', 'transparent']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.edgeHint]}
          />
          <LinearGradient
            colors={['transparent', 'rgba(255,160,0,0.05)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.edgeHint]}
          />
        </>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C0E',
  },
  spotlight: {
    position: 'absolute',
    top: -100,
    left: SCREEN_WIDTH / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,1)',
  },
  edgeHint: {
    pointerEvents: 'none',
  },
});
