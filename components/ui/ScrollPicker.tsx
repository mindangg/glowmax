import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../lib/constants';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface Props {
  values: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  unit: string;
}

export default function ScrollPicker({ values, selectedValue, onValueChange, unit }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = values.indexOf(selectedValue);
  const isScrolling = useRef(false);

  useEffect(() => {
    if (isScrolling.current) return;
    const y = Math.max(0, selectedIndex) * ITEM_HEIGHT;
    scrollRef.current?.scrollTo({ y, animated: false });
  }, [selectedIndex]);

  const handleMomentumScrollEnd = useCallback((e: any) => {
    isScrolling.current = false;
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    onValueChange(values[clamped]);
  }, [values, onValueChange]);

  const handleScrollEndDrag = useCallback((e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    onValueChange(values[clamped]);
  }, [values, onValueChange]);

  const handleScrollBeginDrag = useCallback(() => {
    isScrolling.current = true;
  }, []);

  const items = useMemo(() =>
    values.map((item) => (
      <View key={item} style={styles.item}>
        <Text style={styles.itemText}>{item} {unit}</Text>
      </View>
    )),
    [values, unit]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        contentContainerStyle={styles.content}
        style={styles.scroll}
        scrollEventThrottle={16}
        overScrollMode="never"
        bounces={false}
      >
        {items}
      </ScrollView>
      <View style={styles.selectionOverlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  scroll: {
    height: PICKER_HEIGHT,
  },
  content: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: FONTS.MONO,
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    pointerEvents: 'none',
  },
});
