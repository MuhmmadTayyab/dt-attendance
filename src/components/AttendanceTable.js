import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

const columns = [
  { key: 'date', label: 'تاریخ', width: 110 },
  { key: 'day', label: 'دن', width: 90 },
  { key: 'arrival', label: 'وقت آمد', width: 105 },
  { key: 'departure', label: 'وقت روانگی', width: 110 },
  { key: 'status', label: 'اسٹیٹس', width: 140 },
];

const tableWidth = columns.reduce((total, column) => total + column.width, 0);

function isAbsent(status) {
  const value = String(status || '').toLowerCase();
  return value.includes('غیر حاضر') || value.includes('absent');
}

function isLeave(status) {
  const value = String(status || '').toLowerCase();
  return value.includes('رخصت') || value.includes('leave');
}

function isWeekend(item) {
  const value = `${item?.day || ''} ${item?.status || ''}`.toLowerCase();
  return (
    value.includes('saturday') ||
    value.includes('sunday') ||
    value.includes('weekend') ||
    value.includes('ہفتہ') ||
    value.includes('اتوار') ||
    value.includes('چھٹی')
  );
}

function getWeekendText(item) {
  const day = item?.day && item.day !== '-' ? item.day : '';
  const status = item?.status && item.status !== '-' ? item.status : 'ہفتہ وار چھٹی';
  return day ? `${status} - ${day}` : status;
}

function getCellValue(item, key) {
  if (key === 'status' && isLeave(item.status) && item.leaveReason) {
    return `${item.status}: ${item.leaveReason}`;
  }
  return item[key];
}

function TableCell({ children, width, header, danger }) {
  return (
    <View style={[styles.cell, { width }, header && styles.headerCell, danger && styles.dangerCell]}>
      <Text style={[styles.cellText, header && styles.headerText, danger && styles.dangerText]} numberOfLines={2}>
        {children || '-'}
      </Text>
    </View>
  );
}

function TableRow({ item }) {
  const danger = isAbsent(item.status);

  if (isWeekend(item)) {
    return (
      <View style={styles.row}>
        <View style={[styles.weekendFullCell, { width: tableWidth }]}>
          <Text style={styles.weekendFullText}>{getWeekendText(item)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {columns.map((column) => (
        <TableCell key={column.key} width={column.width} danger={danger}>
          {getCellValue(item, column.key)}
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
    minWidth: tableWidth,
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
  weekendFullCell: {
    minHeight: 52,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(191, 230, 168, 0.13)',
  },
  weekendFullText: {
    color: colors.success,
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 27,
    textAlign: 'center',
    writingDirection: 'rtl',
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
