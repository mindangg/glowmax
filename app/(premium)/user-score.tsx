// User Score Screen — xem card điểm của một người dùng cụ thể
// Navigated to from leaderboard by pressing a row

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import ScoreCard from '../../components/results/ScoreCard';
import { COLORS, FONTS } from '../../lib/constants';
import { LeaderboardEntry } from '../../types';

export default function UserScoreScreen() {
  const router = useRouter();
  const { entry: entryStr } = useLocalSearchParams<{ entry: string }>();

  let entry: LeaderboardEntry | null = null;
  try {
    entry = JSON.parse(entryStr ?? '');
  } catch {
    // invalid param
  }

  if (!entry) {
    return (
      <TrailBackground>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Không tìm thấy dữ liệu.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>QUAY LẠI</Text>
          </TouchableOpacity>
        </View>
      </TrailBackground>
    );
  }

  return (
    <TrailBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CARD ĐIỂM</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Rank badge */}
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>HẠNG #{entry.rank}</Text>
        <Text style={styles.rankSep}> · </Text>
        <Text style={styles.rankScore}>{Math.round(entry.combined_score)} ĐIỂM</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScoreCard
          username={entry.username}
          photoUrl={entry.photo_url}
          combinedScore={entry.combined_score}
          overallScore={entry.overall_score}
          pslTier={entry.psl_tier}
          potentialTier={entry.potential_tier}
          eyesScore={entry.eyes_score}
          jawScore={entry.jaw_score}
          appealScore={entry.appeal_score}
          noseScore={entry.nose_score}
          hairScore={entry.hair_score}
          showViewRankButton={false}
        />
      </ScrollView>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 3,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  rankText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 12,
    color: COLORS.ACCENT_GOLD,
    letterSpacing: 1.5,
  },
  rankSep: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  rankScore: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Error state
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  errorText: {
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
  },
  backBtnText: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 2,
  },
});
