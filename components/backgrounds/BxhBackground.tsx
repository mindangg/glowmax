// BxhBackground — full-screen background dùng bxh_bg.png (texture tối, ánh sáng vàng)
// File riêng, KHÔNG thay đổi TrailBackground

import React, { ReactNode } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';

const bxhImage = require('../../assets/images/bxh_bg.png');

interface Props {
  children: ReactNode;
}

export default function BxhBackground({ children }: Props) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={bxhImage}
        resizeMode="cover"
        style={styles.bg}
      >
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0702',
  },
  bg: {
    flex: 1,
  },
});
