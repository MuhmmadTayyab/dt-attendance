import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AttendanceSummary from '../components/AttendanceSummary';
import AttendanceTable from '../components/AttendanceTable';
import Header from '../components/Header';
import MessageBox from '../components/MessageBox';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { getAttendance, getPreviousMonthParams } from '../services/api';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

const tabs = [
  { key: 'attendance', label: 'گزشتہ ماہ کی حاضری' },
  { key: 'summary', label: 'ماہانہ خلاصہ' },
  { key: 'rules', label: 'اصول و ضوابط' },
];

const urduMonths = [
  'جنوری',
  'فروری',
  'مارچ',
  'اپریل',
  'مئی',
  'جون',
  'جولائی',
  'اگست',
  'ستمبر',
  'اکتوبر',
  'نومبر',
  'دسمبر',
];

const urduDays = {
  sunday: 'اتوار',
  monday: 'پیر',
  tuesday: 'منگل',
  wednesday: 'بدھ',
  thursday: 'جمعرات',
  friday: 'جمعہ',
  saturday: 'ہفتہ',
};

function getPreviousMonth() {
  const { month, year } = getPreviousMonthParams();
  const previous = new Date(year, month - 1, 1);
  return {
    month,
    year,
    label: `${urduMonths[previous.getMonth()]} ${previous.getFullYear()}`,
  };
}

function parseDateValue(value) {
  if (!value) return null;
  const normalized = String(value).replace(/\//g, '-');
  const parts = normalized.split('-').map((part) => Number(part));

  if (parts.length >= 3) {
    if (String(parts[0]).length === 4) return new Date(parts[0], parts[1] - 1, parts[2]);
    if (String(parts[2]).length === 4) return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getUrduDay(record) {
  const rawDay = String(record.day || '').trim();
  const lower = rawDay.toLowerCase();
  if (urduDays[lower]) return urduDays[lower];
  if (rawDay) return rawDay;

  const date = parseDateValue(record.date);
  if (!date) return '-';
  return urduDays[date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()] || '-';
}

function isWeekend(record) {
  const day = getUrduDay(record);
  const status = String(record.status || '').toLowerCase();
  return day === 'ہفتہ' || day === 'اتوار' || status.includes('weekend') || status.includes('چھٹی');
}

function isAbsent(record) {
  const status = String(record.status || '').toLowerCase();
  return status.includes('غیر حاضر') || status.includes('absent');
}

function isLeave(record) {
  const status = String(record.status || '').toLowerCase();
  return status.includes('رخصت') || status.includes('leave');
}

function isLate(record) {
  const status = String(record.status || '').toLowerCase();
  return Number(record.lateMinutes || 0) > 0 || status.includes('تاخیر') || status.includes('late');
}

function isPresent(record) {
  const status = String(record.status || '').toLowerCase();
  return status === 'حاضر' || status.includes('present') || isLate(record);
}

function normalizeRecords(records) {
  return [...records]
    .map((record) => ({
      ...record,
      day: getUrduDay(record),
    }))
    .sort((a, b) => {
      const first = parseDateValue(a.date);
      const second = parseDateValue(b.date);
      if (!first || !second) return String(a.date).localeCompare(String(b.date));
      return first.getTime() - second.getTime();
    });
}

function calculateSummary(records) {
  const lateDays = records.filter(isLate).length;
  const lateMinutes = records.reduce((total, record) => total + Number(record.lateMinutes || 0), 0);
  const weekends = records.filter(isWeekend).length;
  const absents = records.filter(isAbsent).length;
  const leaves = records.filter(isLeave).length;
  const workingDays = Math.max(records.length - weekends, 0);
  const presentDays = records.filter((record) => isPresent(record) && !isAbsent(record) && !isLeave(record)).length;

  return {
    lateText: `${lateDays} دن / ${lateMinutes} منٹ`,
    weekends,
    absents,
    leaves,
    workingDays,
    presentDays,
  };
}

function pickProfileValue(source, keys) {
  if (!source) return '';

  if (Array.isArray(source)) {
    for (const item of source) {
      const value = pickProfileValue(item, keys);
      if (value) return value;
    }
    return '';
  }

  if (typeof source === 'object') {
    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null && String(source[key]).trim()) {
        return String(source[key]).trim();
      }
    }

    for (const value of Object.values(source)) {
      if (value && typeof value === 'object') {
        const found = pickProfileValue(value, keys);
        if (found) return found;
      }
    }
  }

  return '';
}

function StaffInfoCard({ user, records, monthLabel }) {
  const firstRecord = records[0] || {};
  const profile = user?.profile;
  const employeeId = user?.employeeId || '-';
  const staffName =
    pickProfileValue(profile, ['staff_name', 'employee_name', 'name', 'full_name', 'teacher_name', 'نام']) ||
    firstRecord.staffName ||
    'نام دستیاب نہیں';
  const branchName =
    pickProfileValue(profile, ['branch_name', 'branch', 'campus', 'department', 'برانچ']) ||
    firstRecord.branchName ||
    'برانچ دستیاب نہیں';

  return (
    <View style={styles.staffCard}>
      <View style={styles.staffRow}>
        <Text style={styles.staffValue}>{staffName}</Text>
        <Text style={styles.staffLabel}>مکمل نام</Text>
      </View>
      <View style={styles.staffRow}>
        <Text style={styles.staffValue}>{branchName}</Text>
        <Text style={styles.staffLabel}>برانچ</Text>
      </View>
      <View style={styles.staffRow}>
        <Text style={styles.staffValue}>{employeeId}</Text>
        <Text style={styles.staffLabel}>ملازم نمبر</Text>
      </View>
      <View style={styles.staffRow}>
        <Text style={styles.staffValue}>{monthLabel}</Text>
        <Text style={styles.staffLabel}>مہینہ</Text>
      </View>
    </View>
  );
}

function RulesPage() {
  return (
    <View style={styles.rulesCard}>
      <Text style={styles.rulesTitle}>اصول و ضوابط</Text>
      <Text style={styles.rulesText}>
        یہاں حاضری کے اصول و ضوابط شامل کیے جائیں گے۔ آپ بعد میں اس حصے میں اردو پیراگراف، تاخیر کے قواعد، رخصت کی شرائط، اور غیر حاضری کی وضاحت آسانی سے شامل کر سکتے ہیں۔
      </Text>
      <Text style={styles.rulesText}>
        متن کو پڑھنے میں آسان رکھنے کے لیے یہ حصہ اسکرول کے ساتھ بنایا گیا ہے۔
      </Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const previousMonth = useMemo(getPreviousMonth, []);
  const [activeTab, setActiveTab] = useState('attendance');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAttendance = useCallback(async () => {
    if (!user?.employeeId) return;

    setLoading(true);
    setError('');

    try {
      const data = await getAttendance(user.employeeId, user.idCard, {
        month: previousMonth.month,
        year: previousMonth.year,
      });
      setRecords(normalizeRecords(data));
    } catch (err) {
      setError(err?.message || 'حاضری کا ریکارڈ لوڈ نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کریں۔');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [previousMonth.month, previousMonth.year, user?.employeeId, user?.idCard]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const summary = useMemo(() => calculateSummary(records), [records]);

  return (
    <Screen scroll={false}>
      <Header title="حاضری" navigation={navigation} />

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, selected && styles.activeTab]}
            >
              <Text style={[styles.tabText, selected && styles.activeTabText]} numberOfLines={2}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StaffInfoCard user={user} records={records} monthLabel={previousMonth.label} />
        <MessageBox message={error} type="error" />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.cream} size="large" />
            <Text style={styles.loadingText}>حاضری لوڈ ہو رہی ہے...</Text>
          </View>
        ) : null}

        {!loading && activeTab === 'attendance' ? (
          <>
            <AttendanceTable records={records} />
            <AttendanceSummary summary={summary} />
          </>
        ) : null}

        {!loading && activeTab === 'summary' ? <AttendanceSummary summary={summary} fullPage /> : null}

        {activeTab === 'rules' ? <RulesPage /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.cream,
  },
  tabText: {
    color: colors.creamMuted,
    fontFamily: font.bold,
    fontSize: 12,
    lineHeight: 22,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  activeTabText: {
    color: colors.cream,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  staffCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  staffRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  staffLabel: {
    color: colors.creamMuted,
    fontFamily: font.bold,
    fontSize: 14,
    lineHeight: 25,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  staffValue: {
    flex: 1,
    color: colors.white,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 29,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  loadingBox: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 16,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  rulesCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  rulesTitle: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rulesText: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 16,
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
