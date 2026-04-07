// Premium Leaderboard Tab — Xếp hạng
// Top 3 podium (inspired by ld1/ld2) + scrollable list below
// Design: luxury minimal, gold only on #1 avatar border

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import { useLeaderboard, LeaderboardEntry } from '../../hooks/useLeaderboard';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useTrialScan } from '../../hooks/useTrialScan';
import { COLORS, FONTS, getBarColor } from '../../lib/constants';

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

// ── Podium item ───────────────────────────────────────────────────────────────

type PodiumItemProps = {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
  isMe: boolean;
};

function PodiumItem({ entry, position, isMe }: PodiumItemProps) {
  const isFirst = position === 1;
  const avatarSize = isFirst ? 64 : 52;
  const borderColor = isFirst ? COLORS.ACCENT_GOLD : 'rgba(255,255,255,0.25)';
  const avatarBg = isFirst
    ? 'rgba(232,197,111,0.12)'
    : 'rgba(255,255,255,0.06)';

  const podiumHeights = { 1: 60, 2: 40, 3: 28 };
  const podiumH = podiumHeights[position];

  return (
    <View style={[styles.podiumItem, isFirst && styles.podiumItemFirst]}>
      {/* Avatar */}
      <View
        style={[
          styles.podiumAvatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            borderColor,
            backgroundColor: avatarBg,
          },
        ]}
      >
        <Text style={[styles.podiumInitial, isFirst && styles.podiumInitialFirst]}>
          {getInitial(entry.username)}
        </Text>
      </View>

      {/* Username */}
      <Text style={[styles.podiumName, isMe && styles.podiumNameMe]} numberOfLines={1}>
        {entry.username}
      </Text>

      {/* Score */}
      <Text style={[styles.podiumScore, isFirst && styles.podiumScoreFirst]}>
        {entry.overall_score.toFixed(1)}
      </Text>

      {/* Podium block */}
      <View style={[styles.podiumBlock, { height: podiumH }]}>
        <Text style={styles.podiumRankNum}>{position}</Text>
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const FILTERS = [10, 20] as const;
type FilterValue = (typeof FILTERS)[number];

export default function LeaderboardTab() {
  const { fetchLeaderboard } = useLeaderboard();
  const { answers } = useOnboarding();
  const { trialResult } = useTrialScan();

  const myUsername = answers.username ?? null;
  const myRank = trialResult?.rank ?? null;

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

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Podium order: 2nd left, 1st center, 3rd right
  const podiumOrder: (LeaderboardEntry | null)[] = [
    top3[1] ?? null,
    top3[0] ?? null,
    top3[2] ?? null,
  ];
  const podiumPositions: (1 | 2 | 3)[] = [2, 1, 3];

  const renderRow = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isMe = myUsername ? item.username === myUsername : false;
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 30).duration(280)}
        style={[styles.row, isMe && styles.rowMe]}
      >
        <View style={styles.rankCol}>
          <Text style={[styles.rankNum, isMe && styles.rankNumMe]}>#{item.rank}</Text>
        </View>
        <View style={styles.nameCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.username, isMe && styles.usernameMe]} numberOfLines={1}>
              {item.username}
            </Text>
            {isMe && <Text style={styles.youBadge}>YOU</Text>}
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${(item.overall_score / 10) * 100}%` as any,
                  backgroundColor: getBarColor(item.overall_score),
                },
              ]}
            />
          </View>
        </View>
        <Text style={[styles.scoreText, isMe && styles.scoreTextMe]}>
          {item.overall_score.toFixed(1)}
        </Text>
      </Animated.View>
    );
  };

  return (
    <TrailBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <FlatList
        data={rest}
        keyExtractor={(item) => item.username}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
              <Text style={styles.title}>XẾP HẠNG</Text>
              {totalUsers !== null && (
                <Text style={styles.subtitle}>{totalUsers} NGƯỜI DÙNG</Text>
              )}
            </Animated.View>

            {/* My rank banner */}
            {myRank !== null && (
              <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.myRankBanner}>
                <Text style={styles.myRankLabel}>HẠNG CỦA BẠN</Text>
                <Text style={styles.myRankValue}>
                  #{myRank}
                  {totalUsers ? (
                    <Text style={styles.myRankTotal}> / {totalUsers}</Text>
                  ) : null}
                </Text>
              </Animated.View>
            )}

            {/* Top 3 Podium */}
            {!loading && top3.length >= 1 && (
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
                        />
                      ) : (
                        <View key={idx} style={styles.podiumPlaceholder} />
                      )
                    )}
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Divider */}
            {rest.length > 0 && <View style={styles.divider} />}

            {/* Filter tabs */}
            <View style={styles.filters}>
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterTab, filter === f && styles.filterTabActive]}
                  onPress={() => setFilter(f)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                    TOP {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {loading && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={COLORS.TEXT_SECONDARY} />
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.emptyText}>CHƯA CÓ DỮ LIỆU</Text>
            </View>
          ) : null
        }
      />
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 16,
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

  // My rank banner
  myRankBanner: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myRankLabel: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  myRankValue: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  myRankTotal: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
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
    maxWidth: 110,
  },
  podiumItemFirst: {
    marginBottom: 0,
  },
  podiumAvatar: {
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumInitial: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 20,
    color: COLORS.TEXT_PRIMARY,
  },
  podiumInitialFirst: {
    fontSize: 24,
  },
  podiumName: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
    marginBottom: 2,
    maxWidth: 90,
    textAlign: 'center',
  },
  podiumNameMe: {
    color: COLORS.TEXT_PRIMARY,
  },
  podiumScore: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  podiumScoreFirst: {
    fontSize: 15,
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
    maxWidth: 110,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 24,
    marginVertical: 16,
  },

  // Filters
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  filterTabActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterText: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
  },
  filterTextActive: {
    fontFamily: FONTS.MONO_BOLD,
    color: COLORS.TEXT_PRIMARY,
  },

  // List rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  rowMe: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  rankCol: {
    width: 36,
    alignItems: 'center',
  },
  rankNum: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  rankNumMe: {
    color: COLORS.TEXT_PRIMARY,
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
    flexShrink: 1,
  },
  usernameMe: {
    fontFamily: FONTS.MONO_BOLD,
  },
  youBadge: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
  scoreText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    width: 36,
    textAlign: 'right',
  },
  scoreTextMe: {
    color: COLORS.TEXT_PRIMARY,
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
