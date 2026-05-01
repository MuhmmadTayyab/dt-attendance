import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Clock3, LogIn, LogOut, ShieldCheck } from 'lucide-react-native';
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

export default function AttendanceCard({ item }) {
  return (
    <View style={styles.card}>
      <Field icon={CalendarDays} label="تاریخ" value={item.date} />
      <Field icon={LogIn} label="وقتِ آمد" value={item.arrival} />
      <Field icon={LogOut} label="وقتِ روانگی" value={item.departure} />
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
