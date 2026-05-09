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

const messageWidth = columns.slice(2).reduce((total, column) => total + column.width, 0);
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

function getWeekendText(item) {
  return item?.status && item.status !== '-' ? item.status : 'ہفتہ وار چھٹی';
}

function getLeaveText(item) {
  return item?.leaveReason ? `رخصت بوجہ ${item.leaveReason}` : item?.status || 'رخصت';
}

function getAbsentText(item) {
  return item?.status || 'غیر حاضر';
}

function TableCell({ children, width, header }) {
  return (
    <View style={[styles.cell, { width }, header && styles.headerCell]}>
      <Text style={[styles.cellText, header && styles.headerText]} numberOfLines={2}>
        {children || '-'}
      </Text>
    </View>
  );
}

function StatusMessageCell({ children, style, textStyle }) {
  return (
    <View style={[styles.messageCell, { width: messageWidth }, style]}>
      <Text style={[styles.messageText, textStyle]} numberOfLines={2}>
        {children}
      </Text>
    </View>
  );
}

function StatusRow({ item, children, style, textStyle }) {
  return (
    <View style={styles.row}>
      <TableCell width={columns[0].width}>{item.date}</TableCell>
      <TableCell width={columns[1].width}>{item.day}</TableCell>
      <StatusMessageCell style={style} textStyle={textStyle}>
        {children}
      </StatusMessageCell>
    </View>
  );
}

function TableRow({ item }) {
  if (isWeekend(item)) {
    return (
      <StatusRow item={item} style={styles.weekendMessageCell} textStyle={styles.weekendMessageText}>
        {getWeekendText(item)}
      </StatusRow>
    );
  }

  if (isLeave(item.status)) {
    return (
      <StatusRow item={item} style={styles.leaveMessageCell} textStyle={styles.leaveMessageText}>
        {getLeaveText(item)}
      </StatusRow>
    );
  }

  if (isAbsent(item.status)) {
    return (
      <StatusRow item={item} style={styles.absentMessageCell} textStyle={styles.absentMessageText}>
        {getAbsentText(item)}
      </StatusRow>
    );
  }

  return (
    <View style={styles.row}>
      {columns.map((column) => (
        <TableCell key={column.key} width={column.width}>
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
  messageCell: {
    minHeight: 48,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  weekendMessageCell: {
    backgroundColor: 'rgba(191, 230, 168, 0.13)',
  },
  leaveMessageCell: {
    backgroundColor: 'rgba(255, 212, 138, 0.12)',
  },
  absentMessageCell: {
    backgroundColor: 'rgba(255, 180, 168, 0.11)',
  },
  messageText: {
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 27,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  weekendMessageText: {
    color: colors.success,
  },
  leaveMessageText: {
    color: colors.warning,
  },
  absentMessageText: {
    color: colors.danger,
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
