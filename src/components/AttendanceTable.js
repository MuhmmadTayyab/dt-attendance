import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

const columns = [
  { key: 'date', label: 'تاریخ', width: 110 },
  { key: 'day', label: 'دن', width: 90 },
  { key: 'arrival', label: 'وقت آمد', width: 105 },
  { key: 'departure', label: 'وقت روانگی', width: 110 },
  { key: 'status', label: 'اسٹیٹس', width: 110 },
];

function isAbsent(status) {
  return String(status || '').includes('غیر حاضر');
}

function isWeekend(day) {
  const value = String(day || '').toLowerCase();
  return value.includes('saturday') || value.includes('sunday') || value.includes('ہفتہ') || value.includes('اتوار');
}

function TableCell({ children, width, header, danger, weekend }) {
  return (
    <View style={[styles.cell, { width }, header && styles.headerCell, danger && styles.dangerCell, weekend && styles.weekendCell]}>
      <Text style={[styles.cellText, header && styles.headerText, danger && styles.dangerText]} numberOfLines={2}>
        {children || '-'}
      </Text>
    </View>
  );
}

function TableRow({ item }) {
  const danger = isAbsent(item.status);
  const weekend = isWeekend(item.day);

  return (
    <View style={styles.row}>
      {columns.map((column) => (
        <TableCell key={column.key} width={column.width} danger={danger} weekend={weekend}>
          {item[column.key]}
        </TableCell>
      ))}
    </View>
  );
}

export default function AttendanceTable({ records }) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalContent}>
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            {columns.map((column) => (
              <TableCell key={column.key} width={column.width} header>
                {column.label}
              </TableCell>
            ))}
          </View>

          <FlatList
            data={records}
            keyExtractor={(item, index) => `${item.id || item.date || 'record'}-${index}`}
            renderItem={({ item }) => <TableRow item={item} />}
            ListEmptyComponent={<Text style={styles.empty}>کوئی ریکارڈ موجود نہیں</Text>}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  horizontalContent: {
    flexGrow: 1,
  },
  table: {
    minWidth: 525,
    flex: 1,
  },
  row: {
    flexDirection: 'row-reverse',
  },
  headerRow: {
    backgroundColor: colors.primary,
  },
  cell: {
    minHeight: 48,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
  },
  headerCell: {
    backgroundColor: colors.primary,
  },
  dangerCell: {
    backgroundColor: 'rgba(255, 180, 168, 0.09)',
  },
  weekendCell: {
    backgroundColor: 'rgba(255, 212, 138, 0.08)',
  },
  cellText: {
    color: colors.white,
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  headerText: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 14,
  },
  dangerText: {
    color: colors.danger,
    fontFamily: font.bold,
  },
  empty: {
    color: colors.creamMuted,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 30,
    padding: spacing.lg,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
