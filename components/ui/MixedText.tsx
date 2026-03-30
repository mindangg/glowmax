import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../lib/constants';
import { MixedTextSegment } from '../../types';

interface Props {
  segments: MixedTextSegment[];
  style?: object;
}

export default function MixedText({ segments, style }: Props) {
  return (
    <Text style={[styles.container, style]}>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={{
            fontFamily: seg.bold ? FONTS.MONO_BOLD : FONTS.MONO,
            color: seg.color || (seg.bold ? COLORS.TEXT_PRIMARY : COLORS.MUTED_GRAY),
            fontSize: seg.size || 16,
          }}
        >
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    textAlign: 'center',
    textTransform: 'uppercase',
    lineHeight: 28,
  },
});
