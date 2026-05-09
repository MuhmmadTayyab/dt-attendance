import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, LogIn, LogOut, ShieldCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

function Field({ icon: Icon, label, value }) {
  return (
    <View style={styles.field}>
      <Icon color={colors.creamMuted} size={18} />
      <View style={styles.fieldText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || '-'}</Text>
      </View>
    </View>
  );
}

function isWeekend(item) {
  const value = [
    item?.status,
    item?.statusSignIn,
    item?.statusSignOut,
    item?.source?.status,
    item?.source?.attendance_status,
    item?.source?.details,
    item?.source?.type,
    item?.source?.holiday_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    value.includes('weekend') ||
    value.includes('weekly off') ||
    value.includes('weekly holiday') ||
    value.includes('ہفتہ وار چھٹی') ||
    value.includes('چھٹی')
  );
}

function isLeave(item) {
  const value = String(item?.status || '').toLowerCase();
  return value.includes('رخصت') || value.includes('leave');
}

function isAbsent(item) {
  const value = String(item?.status || '').toLowerCase();
  return value.includes('غیر حاضر') || value.includes('absent');
}

function StatusOnlyCard({ item, style, textStyle, text }) {
  return (
    <View style={[styles.card, style]}>
      <Field icon={CalendarDays} label="تاریخ" value={item.date} />
      <Text style={[styles.statusOnlyText, textStyle]}>{text}</Text>
    </View>
  );
}

export default function AttendanceCard({ item }) {
  if (isWeekend(item)) {
    return (
      <StatusOnlyCard
        item={item}
        style={styles.weekendCard}
        textStyle={styles.weekendText}
        text={item.day ? `${item.status} - ${item.day}` : item.status}
      />
    );
  }

  if (isLeave(item)) {
    return (
      <StatusOnlyCard
        item={item}
        style={styles.leaveCard}
        textStyle={styles.leaveText}
        text={item.leaveReason ? `رخصت بوجہ ${item.leaveReason}` : item.status || 'رخصت'}
      />
    );
  }

  if (isAbsent(item)) {
    return (
      <StatusOnlyCard
        item={item}
        style={styles.absentCard}
        textStyle={styles.absentText}
        text={item.status || 'غیر حاضر'}
      />
    );
  }

  return (
    <View style={styles.card}>
      <Field icon={CalendarDays} label="تاریخ" value={item.date} />
      <Field icon={LogIn} label="وقت آمد" value={item.arrival} />
      <Field icon={LogOut} label="وقت روانگی" value={item.departure} />
      <Field icon={ShieldCheck} label="اسٹیٹس" value={item.status} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  weekendCard: {
    backgroundColor: 'rgba(191, 230, 168, 0.13)',
    borderColor: colors.success,
  },
  leaveCard: {
    backgroundColor: 'rgba(255, 212, 138, 0.12)',
    borderColor: colors.warning,
  },
  absentCard: {
    backgroundColor: 'rgba(255, 180, 168, 0.11)',
    borderColor: colors.danger,
  },
  statusOnlyText: {
    fontFamily: font.bold,
    fontSize: 17,
    lineHeight: 31,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  weekendText: {
    color: colors.success,
  },
  leaveText: {
    color: colors.warning,
  },
  absentText: {
    color: colors.danger,
  },
  field: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldText: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    color: colors.creamMuted,
    fontFamily: font.bold,
    fontSize: 14,
    lineHeight: 25,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  value: {
    color: colors.white,
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 27,
    textAlign: 'left',
    writingDirection: 'rtl',
    flexShrink: 1,
  },
});
