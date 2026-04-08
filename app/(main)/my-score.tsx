// My Score Screen — màn hình full điểm tổng quát của user sau scan
// Navigate từ results.tsx khi bấm "XEM ĐIỂM TỔNG QUÁT"
// Giống user-score.tsx nhưng có thêm nút VỀ TRANG CHỦ

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
import FrostedButton from '../../components/ui/FrostedButton';
import { COLORS, FONTS } from '../../lib/constants';

interface MyScoreData {
  username: string;
  photoUri?: string;
  combinedScore: number;
  pslTier?: string;
  potentialTier?: string;
  eyesScore?: number;
  jawScore?: number;
  appealScore?: number;
  noseScore?: number;
  hairScore?: number;
}

export default function MyScoreScreen() {
  const router = useRouter();
  const { data: dataStr } = useLocalSearchParams<{ data: string }>();

  let scoreData: MyScoreData | null = null;
  try {
    scoreData = JSON.parse(dataStr ?? '');
  } catch {
    // invalid param
  }

  const handleHome = () => {
    router.replace('/(main)/');
  };

  const handleViewRank = () => {
    router.push('/(premium)/leaderboard');
  };

  if (!scoreData) {
    return (
      <TrailBackground>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Không tải được dữ liệu.</Text>
          <TouchableOpacity onPress={handleHome} style={styles.backBtn}>
            <Text style={styles.backBtnText}>VỀ TRANG CHỦ</Text>
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
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ĐIỂM CỦA BẠN</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScoreCard
          username={scoreData.username}
          photoUrl={scoreData.photoUri}
          combinedScore={scoreData.combinedScore}
          pslTier={scoreData.pslTier}
          potentialTier={scoreData.potentialTier}
          eyesScore={scoreData.eyesScore}
          jawScore={scoreData.jawScore}
          appealScore={scoreData.appealScore}
          noseScore={scoreData.noseScore}
          hairScore={scoreData.hairScore}
          showViewRankButton
          onViewRank={handleViewRank}
        />

        {/* Nút về trang chủ */}
        <View style={styles.homeBtn}>
          <FrostedButton label="VỀ TRANG CHỦ" onPress={handleHome} variant="default" />
        </View>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 16,
  },
  homeBtn: {
    width: '100%',
  },
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
