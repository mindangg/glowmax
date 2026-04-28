// Premium Info Tab — Thông tin
// List of 22 PAGE.md sections grouped by category → tap to read detail
// Design: luxury minimal, typography-only, no gold, no icons

import React, {useState} from 'react';
import {ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import {getSectionsByCategory, INFO_CATEGORIES, INFO_SECTIONS, InfoSection,} from '../../lib/infoContent';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {COLORS, FONTS} from '../../lib/constants';

// ── Detail view ───────────────────────────────────────────────────────────────

type DetailViewProps = {
  section: InfoSection;
  onBack: () => void;
};

function DetailView({ section, onBack }: DetailViewProps) {
  return (
    <TrailBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.detailContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backText}>← QUAY LẠI</Text>
        </TouchableOpacity>

        {/* Category label */}
        <Text style={styles.detailCategory}>{section.categoryLabel.toUpperCase()}</Text>

        {/* Title */}
        <Text style={styles.detailTitle}>{section.title}</Text>

        {/* Divider */}
        <View style={styles.detailDivider} />

        {/* Content blocks */}
        {section.content.map((block, idx) => (
          <View key={idx} style={styles.contentBlock}>
            {block.heading && (
              <Text style={styles.blockHeading}>{block.heading.toUpperCase()}</Text>
            )}
            <Text style={styles.blockBody}>{block.body}</Text>
          </View>
        ))}

        <View style={styles.detailSpacer} />
      </ScrollView>
    </TrailBackground>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

type ListViewProps = {
  onSelect: (section: InfoSection) => void;
};

function ListView({ onSelect }: ListViewProps) {
  return (
    <TrailBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>THÔNG TIN</Text>
          <Text style={styles.subtitle}>{INFO_SECTIONS.length} MỤC</Text>
        </Animated.View>

        {/* Category groups */}
        {INFO_CATEGORIES.map((cat, catIdx) => {
          const sections = getSectionsByCategory(cat.key as InfoSection['category']);
          if (sections.length === 0) return null;
          return (
            <Animated.View
              key={cat.key}
              entering={FadeInDown.delay(catIdx * 80).duration(400)}
              style={styles.categoryGroup}
            >
              <Text style={styles.categoryHeader}>{cat.label.toUpperCase()}</Text>

              {sections.map((section, idx) => (
                <TouchableOpacity
                  key={section.id}
                  style={[styles.card, idx === sections.length - 1 && styles.cardLast]}
                  onPress={() => onSelect(section)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cardTitle}>{section.title}</Text>
                  <Text style={styles.cardSummary} numberOfLines={2}>
                    {section.summary}
                  </Text>
                  <Text style={styles.cardArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          );
        })}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </TrailBackground>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function InfoTab() {
  const [selectedSection, setSelectedSection] = useState<InfoSection | null>(null);

  if (selectedSection) {
    return (
      <DetailView
        section={selectedSection}
        onBack={() => setSelectedSection(null)}
      />
    );
  }

  return <ListView onSelect={setSelectedSection} />;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },

  // List view
  listContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 28,
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
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  categoryGroup: {
    marginBottom: 28,
  },
  categoryHeader: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 3,
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    position: 'relative',
  },
  cardLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  cardTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingRight: 20,
  },
  cardSummary: {
    fontFamily: 'System',
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
  },
  cardArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    fontFamily: FONTS.MONO,
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  bottomSpacer: {
    height: 20,
  },

  // Detail view
  detailContent: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  backBtn: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  detailCategory: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 3,
    marginBottom: 8,
  },
  detailTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 20,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
    lineHeight: 28,
    marginBottom: 20,
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
  },
  contentBlock: {
    marginBottom: 24,
  },
  blockHeading: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  blockBody: {
    fontFamily: 'System',
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 24,
  },
  detailSpacer: {
    height: 40,
  },
});
