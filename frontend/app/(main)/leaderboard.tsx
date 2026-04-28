import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import BackArrow from '../../components/ui/BackArrow';
import { useLeaderboard, LeaderboardEntry } from '../../hooks/useLeaderboard';
import { useOnboarding } from '../../hooks/useOnboarding';
import { COLORS, FONTS, getBarColor } from '../../lib/constants';

const FILTERS = [3, 5, 10, 20] as const;
type FilterValue = typeof FILTERS[number];

const { width: SW } = Dimensions.get('window');

export default function LeaderboardScreen() {
  const { myRank: myRankParam } = useLocalSearchParams<{ myRank?: string }>();
  const { fetchLeaderboard } = useLeaderboard();
  const { answers } = useOnboarding();
  const myUsername = answers.username ?? null;
  const myRank = myRankParam ? parseInt(myRankParam, 10) : null;

  const [filter, setFilter] = useState<FilterValue>(10);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(filter).then((data) => {
      setEntries(data);
      if (data.length > 0) setTotalUsers(data[0].total_users);
      setLoading(false);
    });
  }, [filter]);

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isMe = myUsername && item.username === myUsername;
    const isTop3 = item.rank <= 3;
    const rankEmoji = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : null;
    const barColor = getBarColor(item.overall_score);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 40).duration(300)}
        style={[styles.row, isMe && styles.rowMe]}
      >
        {/* Rank */}
        <View style={styles.rankCol}>
          {rankEmoji ? (
            <Text style={styles.rankEmoji}>{rankEmoji}</Text>
          ) : (
            <Text style={[styles.rankNum, isMe && styles.rankNumMe]}>#{item.rank}</Text>
          )}
        </View>

        {/* Username + bar */}
        <View style={styles.nameCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.username, isMe && styles.usernameMe]} numberOfLines={1}>
              {item.username}
            </Text>
            {isMe && <Text style={styles.youBadge}>YOU</Text>}
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(item.overall_score / 10) * 100}%` as any, backgroundColor: barColor }]} />
          </View>
        </View>

        {/* Score */}
        <Text style={[styles.score, isMe && styles.scoreMe]}>
          {item.overall_score.toFixed(1)}
        </Text>
      </Animated.View>
    );
  };

  return (
    <TrailBackground>
      <BackArrow />
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>LEADERBOARD</Text>
        {totalUsers !== null && (
          <Text style={styles.subtitle}>{totalUsers} NGƯỜI DÙNG</Text>
        )}

        {/* My rank banner */}
        {myRank !== null && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.myRankBanner}>
            <Text style={styles.myRankLabel}>RANK CỦA BẠN</Text>
            <Text style={styles.myRankValue}>
              #{myRank}
              {totalUsers ? <Text style={styles.myRankTotal}> / {totalUsers}</Text> : null}
            </Text>
          </Animated.View>
        )}

        {/* Filter tabs */}
        <View style={styles.tabs}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.tab, filter === f && styles.tabActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
                TOP {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={COLORS.ACCENT_GOLD} />
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.emptyText}>CHƯA CÓ DỮ LIỆU</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.username}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 3,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
    marginBottom: 16,
  },
  myRankBanner: {
    backgroundColor: 'rgba(232,197,111,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,111,0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  myRankLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  myRankValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 20,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 1,
  },
  myRankTotal: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: 'rgba(232,197,111,0.5)',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: {
    backgroundColor: 'rgba(232,197,111,0.15)',
    borderColor: 'rgba(232,197,111,0.4)',
  },
  tabText: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: COLORS.ACCENT_GOLD,
    fontFamily: FONTS.MONO_BOLD,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  listContent: {
    gap: 8,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowMe: {
    backgroundColor: 'rgba(232,197,111,0.08)',
    borderColor: 'rgba(232,197,111,0.3)',
  },
  rankCol: {
    width: 36,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 20,
  },
  rankNum: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
  },
  rankNumMe: {
    color: COLORS.ACCENT_GOLD,
  },
  nameCol: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  usernameMe: {
    color: COLORS.ACCENT_GOLD,
    fontFamily: FONTS.MONO_BOLD,
  },
  youBadge: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 9,
    color: COLORS.ACCENT_GOLD,
    backgroundColor: 'rgba(232,197,111,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 1,
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
  score: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    width: 36,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  scoreMe: {
    color: COLORS.ACCENT_GOLD,
  },
});
