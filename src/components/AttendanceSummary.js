import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

const summaryItems = [
  { key: 'lateText', label: 'کل تاخیر' },
  { key: 'weekends', label: 'کل ہفتہ وار چھٹیاں' },
  { key: 'absents', label: 'کل غیر حاضریاں' },
  { key: 'leaves', label: 'کل رخصتیں' },
  { key: 'workingDays', label: 'کل ورکنگ دن' },
  { key: 'presentDays', label: 'کل حاضر دن' },
];

export default function AttendanceSummary({ summary, fullPage = false }) {
  return (
    <View style={[styles.card, fullPage && styles.fullPage]}>
      <Text style={styles.title}>ماہانہ خلاصہ</Text>
      <View style={styles.grid}>
        {summaryItems.map((item) => (
          <View key={item.key} style={styles.item}>
            <Text style={styles.value}>{summary[item.key]}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  fullPage: {
    padding: spacing.lg,
  },
  title: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 20,
    lineHeight: 34,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '48%',
    minHeight: 82,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: spacing.md,
  },
  value: {
    color: colors.white,
    fontFamily: font.bold,
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  label: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 23,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
