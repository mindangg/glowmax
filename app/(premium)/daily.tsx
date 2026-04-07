// Premium Daily Tab — Hàng ngày
// Week strip + categorized task checklist with expandable PAGE.md info
// Design: luxury minimal, white checkboxes, no gold

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import { useDailyTasks } from '../../hooks/useDailyTasks';
import { DAILY_CATEGORIES, TOTAL_DAILY_TASKS } from '../../lib/dailyTasks';
import { getSectionById } from '../../lib/infoContent';
import { COLORS, FONTS } from '../../lib/constants';

// ── Week strip ────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay(); // 0=Sun
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((day + 6) % 7)); // Mon as first day
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type WeekStripProps = {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
};

function WeekStrip({ selectedDate, onSelectDate }: WeekStripProps) {
  const today = new Date();
  const week = getWeekDates(today);

  return (
    <View style={stripStyles.row}>
      {week.map((d, i) => {
        const active = isSameDay(d, selectedDate);
        const isToday = isSameDay(d, today);
        return (
          <TouchableOpacity
            key={i}
            style={[stripStyles.day, active && stripStyles.dayActive]}
            onPress={() => onSelectDate(d)}
            activeOpacity={0.7}
          >
            <Text style={[stripStyles.dayName, active && stripStyles.dayNameActive]}>
              {DAYS_SHORT[d.getDay()]}
            </Text>
            <Text style={[stripStyles.dayNum, active && stripStyles.dayNumActive, isToday && stripStyles.dayNumToday]}>
              {d.getDate()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const stripStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 20,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  dayActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dayName: {
    fontFamily: FONTS.MONO,
    fontSize: 9,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dayNameActive: {
    color: COLORS.TEXT_PRIMARY,
  },
  dayNum: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  dayNumActive: {
    fontFamily: FONTS.MONO_BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  dayNumToday: {
    color: COLORS.TEXT_PRIMARY,
  },
});

// ── Task row ──────────────────────────────────────────────────────────────────

type TaskRowProps = {
  taskId: string;
  label: string;
  infoKey: string;
  infoSummary: string;
  checked: boolean;
  onToggle: () => void;
};

function TaskRow({ taskId, label, infoKey, infoSummary, checked, onToggle }: TaskRowProps) {
  const [expanded, setExpanded] = useState(false);
  const section = getSectionById(infoKey);

  return (
    <View style={taskStyles.container}>
      <Pressable
        style={taskStyles.row}
        onPress={() => setExpanded((p) => !p)}
        android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={[taskStyles.checkbox, checked && taskStyles.checkboxChecked]}
          onPress={onToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          {checked && <Text style={taskStyles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* Label */}
        <Text style={[taskStyles.label, checked && taskStyles.labelChecked]} numberOfLines={2}>
          {label}
        </Text>
      </Pressable>

      {/* Expandable info */}
      {expanded && (
        <View style={taskStyles.infoCard}>
          {section && (
            <Text style={taskStyles.infoTitle}>{section.title}</Text>
          )}
          <Text style={taskStyles.infoBody}>{infoSummary}</Text>
        </View>
      )}
    </View>
  );
}

const taskStyles = StyleSheet.create({
  container: {
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.TEXT_PRIMARY,
    borderColor: COLORS.TEXT_PRIMARY,
  },
  checkmark: {
    fontSize: 11,
    color: COLORS.BACKGROUND_PRIMARY,
    fontFamily: FONTS.MONO_BOLD,
  },
  label: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    lineHeight: 19,
  },
  labelChecked: {
    color: COLORS.TEXT_SECONDARY,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  infoTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  infoBody: {
    fontFamily: 'System',
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function DailyTab() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { checked, toggle, completedCount, totalCount, loaded } = useDailyTasks(selectedDate);

  return (
    <TrailBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>HÀNG NGÀY</Text>
          <Text style={styles.counter}>
            {loaded ? `${completedCount}/${totalCount} HOÀN THÀNH` : '...'}
          </Text>
        </Animated.View>

        {/* Week strip */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </Animated.View>

        {/* Categories */}
        {DAILY_CATEGORIES.map((cat, catIdx) => (
          <Animated.View
            key={cat.id}
            entering={FadeInDown.delay(160 + catIdx * 60).duration(400)}
            style={styles.categoryBlock}
          >
            {/* Category header */}
            <Text style={styles.categoryTitle}>{cat.title.toUpperCase()}</Text>

            {/* Tasks */}
            <View style={styles.taskList}>
              {cat.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  taskId={task.id}
                  label={task.label}
                  infoKey={task.infoKey}
                  infoSummary={task.infoSummary}
                  checked={checked.has(task.id)}
                  onToggle={() => toggle(task.id)}
                />
              ))}
            </View>
          </Animated.View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </TrailBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 4,
  },
  counter: {
    fontFamily: FONTS.MONO,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  categoryBlock: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 3,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  taskList: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  bottomSpacer: {
    height: 20,
  },
});
