// Premium Leaderboard Tab — Xếp hạng
// Top 3 podium với ảnh + list + debounced search
// Click vào bất kỳ entry → user-score screen

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import { useLeaderboard, LeaderboardEntry } from '../../hooks/useLeaderboard';
import { useOnboarding } from '../../hooks/useOnboarding';
import { COLORS, FONTS, getTierColor, PSL_TIER_ORDER } from '../../lib/constants';
import { PSLTier } from '../../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

// ── Top-3 Avatar ──────────────────────────────────────────────────────────────

type AvatarProps = {
  entry: LeaderboardEntry;
  size: number;
  isFirst: boolean;
};

function PodiumAvatar({ entry, size, isFirst }: AvatarProps) {
  const borderColor = isFirst ? COLORS.ACCENT_GOLD : 'rgba(255,255,255,0.3)';
  return (
    <View
      style={[
        styles.podiumAvatarWrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          borderWidth: isFirst ? 2.5 : 1.5,
        },
      ]}
    >
      {entry.photo_url ? (
        <Image
          source={{ uri: entry.photo_url }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.podiumAvatarFallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.podiumInitial, { fontSize: isFirst ? 26 : 20 }]}>
            {getInitial(entry.username)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Podium Item ───────────────────────────────────────────────────────────────

type PodiumItemProps = {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
  isMe: boolean;
  onPress: () => void;
};

const PODIUM_HEIGHTS: Record<1 | 2 | 3, number> = { 1: 60, 2: 40, 3: 28 };
const PODIUM_AVATAR_SIZES: Record<1 | 2 | 3, number> = { 1: 72, 2: 56, 3: 52 };

function PodiumItem({ entry, position, isMe, onPress }: PodiumItemProps) {
  const isFirst = position === 1;
  const tierColor = entry.psl_tier ? getTierColor(entry.psl_tier as PSLTier) : COLORS.TEXT_SECONDARY;

  return (
    <TouchableOpacity
      style={[styles.podiumItem, isFirst && styles.podiumItemFirst]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <PodiumAvatar entry={entry} size={PODIUM_AVATAR_SIZES[position]} isFirst={isFirst} />

      <Text style={[styles.podiumName, isMe && styles.podiumNameMe]} numberOfLines={1}>
        {entry.username}
      </Text>

      {/* Score */}
      <Text style={[styles.podiumScore, isFirst && styles.podiumScoreFirst]}>
        {Math.round(entry.combined_score)}
      </Text>

      {/* PSL tier label */}
      {entry.psl_tier && (
        <Text style={[styles.podiumTier, { color: tierColor }]}>
          {entry.psl_tier.toUpperCase()}
        </Text>
      )}

      {/* Podium block */}
      <View style={[styles.podiumBlock, { height: PODIUM_HEIGHTS[position] }]}>
        <Text style={styles.podiumRankNum}>{position}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── List Row ──────────────────────────────────────────────────────────────────

type RowProps = {
  item: LeaderboardEntry;
  index: number;
  isMe: boolean;
  onPress: () => void;
};

function ListRow({ item, index, isMe, onPress }: RowProps) {
  const tierColor = item.psl_tier ? getTierColor(item.psl_tier as PSLTier) : 'transparent';
  const barPct = Math.min(item.combined_score / 100, 1) * 100;

  return (
    <Animated.View entering={FadeInDown.delay(index * 25).duration(260)}>
      <TouchableOpacity
        style={[styles.row, isMe && styles.rowMe]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {/* Rank */}
        <Text style={[styles.rankNum, isMe && styles.rankNumMe]}>#{item.rank}</Text>

        {/* Mini avatar */}
        <View style={styles.rowAvatarWrap}>
          {item.photo_url ? (
            <Image
              source={{ uri: item.photo_url }}
              style={styles.rowAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.rowAvatar, styles.rowAvatarFallback]}>
              <Text style={styles.rowInitial}>{getInitial(item.username)}</Text>
            </View>
          )}
        </View>

        {/* Name + bar */}
        <View style={styles.nameCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.username, isMe && styles.usernameMe]} numberOfLines={1}>
              {item.username}
            </Text>
            {isMe && <Text style={styles.youBadge}>BẠN</Text>}
            {item.psl_tier && (
              <Text style={[styles.tierTag, { color: tierColor, borderColor: tierColor }]}>
                {item.psl_tier}
              </Text>
            )}
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${barPct}%`, backgroundColor: isMe ? COLORS.ACCENT_GOLD : tierColor || COLORS.TEXT_SECONDARY },
              ]}
            />
          </View>
        </View>

        {/* Score */}
        <Text style={[styles.scoreText, isMe && styles.scoreTextMe]}>
          {Math.round(item.combined_score)}
        </Text>

        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.25)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LeaderboardTab() {
  const router = useRouter();
  const { fetchLeaderboard, searchLeaderboard } = useLeaderboard();
  const { answers } = useOnboarding();
  const myUsername = answers.username ?? null;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load
  useEffect(() => {
    fetchLeaderboard().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  // Debounced search — 300 ms, no lag even with many users
  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const data = await searchLeaderboard(text);
      setEntries(data);
      setSearching(false);
    }, 300);
  }, []);

  const navigateToUser = (entry: LeaderboardEntry) => {
    router.push({
      pathname: '/(premium)/user-score',
      params: { entry: JSON.stringify(entry) },
    });
  };

  const top3 = entries.slice(0, 3);
  // Podium order: 2nd left, 1st center, 3rd right
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumPositions: (1 | 2 | 3)[] = [2, 1, 3];

  const listData = searchText ? entries : entries.slice(3);
  const totalUsers = entries[0]?.total_users ?? null;

  const renderRow = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <ListRow
      item={item}
      index={index}
      isMe={myUsername ? item.username === myUsername : false}
      onPress={() => navigateToUser(item)}
    />
  );

  return (
    <TrailBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <FlatList
        data={listData}
        keyExtractor={(item) => item.username}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
              <Text style={styles.title}>XẾP HẠNG</Text>
              {totalUsers !== null && (
                <Text style={styles.subtitle}>{totalUsers} NGƯỜI DÙNG</Text>
              )}
            </Animated.View>

            {/* Search bar */}
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.searchWrap}>
              <Ionicons name="search" size={15} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm theo username..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchText}
                onChangeText={handleSearch}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searching && <ActivityIndicator size="small" color={COLORS.TEXT_SECONDARY} style={{ marginRight: 8 }} />}
              {searchText.length > 0 && !searching && (
                <TouchableOpacity onPress={() => handleSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={16} color={COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Top 3 Podium — only when not searching */}
            {!loading && !searchText && top3.length >= 1 && (
              <Animated.View entering={FadeInDown.delay(150).duration(500)}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.03)', 'transparent']}
                  style={styles.podiumArea}
                >
                  <View style={styles.podiumRow}>
                    {podiumOrder.map((entry, idx) =>
                      entry ? (
                        <PodiumItem
                          key={entry.username}
                          entry={entry}
                          position={podiumPositions[idx]}
                          isMe={myUsername ? entry.username === myUsername : false}
                          onPress={() => navigateToUser(entry)}
                        />
                      ) : (
                        <View key={idx} style={styles.podiumPlaceholder} />
                      ),
                    )}
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Divider */}
            {(listData.length > 0 || searching) && <View style={styles.divider} />}

            {loading && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={COLORS.TEXT_SECONDARY} />
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !searching ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.emptyText}>
                {searchText ? 'KHÔNG TÌM THẤY KẾT QUẢ' : 'CHƯA CÓ DỮ LIỆU'}
              </Text>
            </View>
          ) : null
        }
      />
    </TrailBackground>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
  },

  // Podium
  podiumArea: {
    marginHorizontal: 24,
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 0,
    marginBottom: 8,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 120,
  },
  podiumItemFirst: {},
  podiumAvatarWrap: {
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: COLORS.ACCENT_GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  podiumAvatarFallback: {
    backgroundColor: 'rgba(232,197,111,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumInitial: {
    fontFamily: FONTS.MONO_BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  podiumName: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
    marginBottom: 2,
    maxWidth: 100,
    textAlign: 'center',
  },
  podiumNameMe: {
    color: COLORS.TEXT_PRIMARY,
  },
  podiumScore: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  podiumScoreFirst: {
    fontSize: 18,
    color: COLORS.ACCENT_GOLD,
  },
  podiumTier: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 6,
  },
  podiumBlock: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRankNum: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  podiumPlaceholder: {
    flex: 1,
    maxWidth: 120,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 24,
    marginVertical: 14,
  },

  // List rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  rowMe: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  rankNum: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    width: 30,
    textAlign: 'center',
  },
  rankNumMe: {
    color: COLORS.TEXT_PRIMARY,
  },
  rowAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  rowAvatarFallback: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInitial: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  nameCol: {
    flex: 1,
    gap: 5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  username: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    flexShrink: 1,
  },
  usernameMe: {
    fontFamily: FONTS.MONO_BOLD,
  },
  youBadge: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 8,
    color: COLORS.ACCENT_GOLD,
    backgroundColor: 'rgba(232,197,111,0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 1,
  },
  tierTag: {
    fontFamily: FONTS.MONO,
    fontSize: 8,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    letterSpacing: 0.5,
  },
  barTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  scoreText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    width: 32,
    textAlign: 'right',
  },
  scoreTextMe: {
    color: COLORS.ACCENT_GOLD,
  },

  loadingWrap: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
});
