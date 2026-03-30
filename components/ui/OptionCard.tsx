import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../lib/constants';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  multiSelect?: boolean;
}

export default function OptionCard({ label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.GLASS_FILL,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  cardSelected: {
    backgroundColor: COLORS.GLASS_FILL_SELECTED,
  },
  label: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    textTransform: 'uppercase',
    flex: 1,
  },
  labelSelected: {
    color: '#1A1A1A',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioSelected: {
    borderColor: '#1A1A1A',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A1A1A',
  },
});
