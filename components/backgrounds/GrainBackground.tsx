import React, { ReactNode } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/constants';

const grainTexture = require('../../assets/images/trail.jpg');

interface Props {
  children: ReactNode;
}

export default function GrainBackground({ children }: Props) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={grainTexture}
        resizeMode="cover"
        style={styles.background}
        imageStyle={{ opacity: 1 }}
      >
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAIN_BG_BASE,
  },
  background: {
    flex: 1,
  },
});
