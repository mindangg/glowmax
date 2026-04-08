import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../lib/constants';

type TabDef = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: TabDef[] = [
  { name: 'scan', label: 'QUÉT', icon: 'scan-outline', iconActive: 'scan' },
  { name: 'leaderboard', label: 'XẾP HẠNG', icon: 'podium-outline', iconActive: 'podium' },
  { name: 'daily', label: 'HÀNG NGÀY', icon: 'checkmark-circle-outline', iconActive: 'checkmark-circle' },
  { name: 'info', label: 'THÔNG TIN', icon: 'book-outline', iconActive: 'book' },
  { name: 'progress', label: 'TIẾN ĐỘ', icon: 'trending-up-outline', iconActive: 'trending-up' },
];

const LuxuryTabBar = memo(function LuxuryTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
        if (routeIndex === -1) return null;
        const isActive = state.index === routeIndex;
        const iconColor = isActive ? COLORS.TEXT_PRIMARY : 'rgba(255,255,255,0.3)';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[routeIndex].key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(state.routes[routeIndex].name);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.65}
            hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
          >
            {isActive && <View style={styles.activeIndicator} />}

            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={22}
              color={iconColor}
            />

            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const renderTabBar = (props: BottomTabBarProps) => <LuxuryTabBar {...props} />;
const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'none',
  contentStyle: { backgroundColor: COLORS.BACKGROUND_PRIMARY },
} as const;

export default function PremiumLayout() {
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={SCREEN_OPTIONS}
    />
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    height: 68 + (Platform.OS === 'ios' ? 8 : 0),
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    gap: 3,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: 1.5,
    backgroundColor: COLORS.TEXT_PRIMARY,
  },
  tabLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 8,
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.3)',
  },
  tabLabelActive: {
    fontFamily: FONTS.MONO_BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
});
