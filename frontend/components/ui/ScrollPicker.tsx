import React, { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../lib/constants';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 280

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
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  useEffect(() => {
    if (isScrolling.current) return;
    const y = Math.max(0, selectedIndex) * ITEM_HEIGHT;
    scrollRef.current?.scrollTo({ y, animated: false });
    setCurrentIndex(selectedIndex);
  }, [selectedIndex]);

  const handleMomentumScrollEnd = useCallback((e: any) => {
    isScrolling.current = false;
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    setCurrentIndex(clamped);
    onValueChange(values[clamped]);
  }, [values, onValueChange]);

  const handleScrollEndDrag = useCallback((e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    setCurrentIndex(clamped);
    onValueChange(values[clamped]);
  }, [values, onValueChange]);

  const handleScrollBeginDrag = useCallback(() => {
    isScrolling.current = true;
  }, []);

  const handleScroll = useCallback((e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    if (clamped !== currentIndex) {
      setCurrentIndex(clamped);
    }
  }, [values, currentIndex]);

  const items = useMemo(() =>
          values.map((item, index) => {
            const isSelected = index === currentIndex;
            const distance = Math.abs(index - currentIndex);
            const opacity = distance === 0 ? 1 : distance === 1 ? 0.45 : 0.2;
            const fontSize = isSelected ? 22 : 18;

            return (
                <View key={item} style={styles.item}>
                  <Text
                      style={[
                        styles.itemText,
                        {
                          color: isSelected ? COLORS.TEXT_PRIMARY : COLORS.TEXT_SECONDARY,
                          opacity,
                          fontSize,
                          fontFamily: isSelected ? FONTS.MONO_BOLD : FONTS.MONO,
                        },
                      ]}
                  >
                    {item}{' '}
                    <Text
                        style={{
                          color: isSelected ? COLORS.TEXT_PRIMARY : COLORS.TEXT_SECONDARY,
                          opacity: isSelected ? 0.7 : 1,
                          fontSize: isSelected ? 13 : 11,
                          letterSpacing: 2,
                        }}
                    >
                      {unit}
                    </Text>
                  </Text>
                </View>
            );
          }),
      [values, unit, currentIndex]
  );

  return (
      <View style={styles.wrapper}>
        <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScrollBeginDrag={handleScrollBeginDrag}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onScrollEndDrag={handleScrollEndDrag}
            onScroll={handleScroll}
            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
            scrollEventThrottle={16}
            overScrollMode="never"
            bounces={false}
        >
          {items}
        </ScrollView>

        {/* Selection border */}
        <View style={styles.selectionOverlay} pointerEvents="none" />
      </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    letterSpacing: 1,
  },
    selectionOverlay: {
        position: 'absolute',
        top: ITEM_HEIGHT * 2,
        left: 4,
        right: 4,
        height: ITEM_HEIGHT,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',  // ← tăng lên từ 0.04
        // Thêm shadow để tạo depth
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
    },
});