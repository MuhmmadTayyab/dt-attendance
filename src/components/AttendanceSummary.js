import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

const summaryItems = [
  { key: 'totalDays', label: 'اس ماہ کے کل دن' },
  { key: 'weekends', label: 'ہفتہ وار چھٹیاں' },
  { key: 'workingDays', label: 'ورکنگ ڈیز' },
  { key: 'presentDays', label: 'حاضر دن' },
  { key: 'absents', label: 'غیر حاضر دن' },
  { key: 'leaves', label: 'رخصت کے دن' },
  { key: 'onTimeDays', label: 'بروقت آنے کے دن' },
  { key: 'lateDays', label: 'تاخیر سے آنے کے دن' },
  { key: 'lateTotalText', label: 'کل تاخیر' },
  { key: 'earlyLeaveDays', label: 'جلدی جانے کے دن' },
  { key: 'earlyLeaveTotalText', label: 'کل جلدی روانگی' },
];

export default function AttendanceSummary({ summary, fullPage = false }) {
  const leaveReasons = summary.leaveReasons || [];

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

      {leaveReasons.length ? (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>رخصت کی تفصیل</Text>
          {leaveReasons.map((item, index) => (
            <Text key={`${item.date || 'leave'}-${index}`} style={styles.reasonText}>
              {item.date ? `${item.date}: ` : ''}
              {item.reason}
            </Text>
          ))}
        </View>
      ) : null}
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
  reasonBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryDark,
    padding: spacing.md,
    gap: spacing.xs,
  },
  reasonTitle: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  reasonText: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 25,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
