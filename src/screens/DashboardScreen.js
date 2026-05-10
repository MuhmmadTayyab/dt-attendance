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

const ruleFilters = [
  { key: 'all', label: 'تمام' },
  { key: 'attendance', label: 'حاضری' },
  { key: 'late', label: 'تاخیر' },
  { key: 'leave', label: 'رخصت' },
  { key: 'deduction', label: 'کٹوتی' },
];

const attendanceRules = [
  {
    id: '1',
    category: 'attendance',
    title: 'حاضری پہلے لگائیں',
    text: 'حاضری بر وقت لگائیں۔ آتے ہی پہلے حاضری لگائیں، پھر سبق کے لئے تشریف لے جائیں۔ حاضری نہ لگانے کی صورت میں ناظم دفتر سرخ قلم سے نشان لگانے کا مجاز ہے۔ سرخ نشان پر غیر حاضری تصور ہوگی یا کم سے کم ایک گھنٹہ منفی کیا جائے گا۔',
  },
  {
    id: '2',
    category: 'late',
    title: 'ابتدائی 15 منٹ کی رعایت',
    text: 'ابتداء سے 15 منٹ تک تاخیر کی کٹوتی نہیں ہوگی۔ اس کے بعد کی تاخیر کی کٹوتی کی جائے گی۔',
  },
  {
    id: '4',
    category: 'leave',
    title: 'ماہانہ رخصت کا طریقہ',
    text: 'ہر ماہ بامر مجبوری اپنی شاخ کے متعلقہ ناظم صاحب کو اطلاع کے ساتھ 2 رخصت کی اجازت ہوگی۔ دو سے زائد رخصت کی صورت میں چھٹی سے کم از کم 3 ایام قبل درخواست تحریری طور پر متبادل کے نظم اور اس کے دستخط کے ساتھ اپنی شاخ کے متعلقہ ناظم الامور اور ناظم تعلیمات صاحب سے منظور کروا کر بذریعہ ناظم صاحب مرکزی دفتر انتظامیہ میں ارسال کرکے منظور کروانا لازم ہے۔ بصورت دیگر غیر حاضری شمار کی جائے گی۔',
  },
  {
    id: '5',
    category: 'leave',
    title: 'درخواست کی soft copy',
    text: 'سہولت کے لئے hard copy یعنی کاغذ کے بجائے soft copy یعنی تصویر بھی قابل قبول ہوگی۔ تصویر کسی بھی فرد کے نجی نمبر پر ارسال کرنے کے بجائے صرف مرکزی دفتر انتظامیہ کے نمبر پر ہی ارسال فرمائیں۔',
  },
  {
    id: '6',
    category: 'leave',
    title: 'امتحانی ایام اور ذمہ داریاں',
    text: 'امتحانی ایام میں رخصت کی صورت میں درخواست پر امتحانی کمیٹی کے ذمہ داران حضرات کی رائے مع دستخط ارسال کرنا ضروری ہے۔ ناظمین حضرات و اساتذہ کرام ماہ شعبان و رمضان میں ادارے کی طرف سے دی گئی ذمہ داریاں ادا کرنے کے پابند ہوں گے۔',
  },
  {
    id: '7',
    category: 'leave',
    title: 'منظوری کے بغیر چھٹی',
    text: 'بغیر اطلاع کے چھٹی، منظوری سے قبل چھٹی، یا چھٹی کے بعد جمع کروائی گئی درخواست غیر حاضری شمار کی جائے گی اور اس میں کسی قسم کی تبدیلی نہیں ہوگی۔',
  },
  {
    id: '8',
    category: 'leave',
    title: 'سالانہ چھٹیوں کا استحقاق',
    text: 'عملے کے افراد کو سال میں 24 چھٹیوں کا استحقاق حاصل ہوگا۔ شعبان اور رمضان میں حاضر رہنے والے شعبہ حفظ اور دفتری عملے کو سالانہ 36 چھٹیوں کا استحقاق حاصل ہے۔ کل وقتی اساتذہ جو مدرسے میں رہائش پذیر ہیں اور جمعہ المبارک کو نگرانی کے لئے متعین ہیں، انہیں بشمول جمعہ المبارک سالانہ 27 چھٹیوں کا استحقاق حاصل ہوگا۔',
  },
  {
    id: '9',
    category: 'leave',
    title: 'بیماری کی رخصت',
    text: 'بیماری کی وجہ سے زیادہ رخصت ہونے کی درخواست دینا لازم ہے۔ درخواست کے ساتھ مستند ڈاکٹر کی تحریر اور ٹیسٹ رپورٹ لف کرنا لازمی ہے۔',
  },
  {
    id: '10',
    category: 'deduction',
    title: 'غیر حاضری کی کٹوتی',
    text: 'غیر حاضری یعنی بغیر اطلاع کے چھٹی کی مکمل کٹوتی ہوگی۔',
  },
  {
    id: '11',
    category: 'attendance',
    title: 'نئی تقرری والے احباب',
    text: 'نئے تقرری والے احباب جس تاریخ کو مکمل فارم جمع کروائیں گے، اسی تاریخ سے ان کی تنخواہ جاری کی جائے گی۔ پہلے تین ماہ کسی قسم کی رخصت اور تاخیر قابل قبول نہیں ہوگی، چھٹی کو غیر حاضری شمار کیا جائے گا۔',
  },
  {
    id: '12',
    category: 'attendance',
    title: 'امتحانی نگرانی یا ضروری کام',
    text: 'اگر کسی ساتھی نے امتحانی نگرانی یا کسی اور ضروری کام سے جانا ہو تو پہلے سے تحریری طور پر متعلقہ ذمہ داران حضرات کے ذریعے مرکزی دفتر انتظامیہ کو مطلع کرنا لازم ہے۔',
  },
  {
    id: '13',
    category: 'leave',
    title: 'حتمی فیصلہ',
    text: 'رخصت اور حاضری سے متعلق حضرات اہل شوری کا فیصلہ حتمی تصور کیا جائے گا۔',
  },
];

function getPreviousMonth() {
  const { month, year } = getPreviousMonthParams();
  const previous = new Date(year, month - 1, 1);
  return {
    month,
    year,
    label: `${urduMonths[previous.getMonth()]} ${previous.getFullYear()}`,
  };
}

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function formatMinutes(minutes) {
  const total = Number(minutes || 0);
  if (total <= 0) return '0 منٹ';
  const hours = Math.floor(total / 60);
  const remaining = total % 60;
  if (!hours) return `${remaining} منٹ`;
  if (!remaining) return `${hours} گھنٹے`;
  return `${hours} گھنٹے ${remaining} منٹ`;
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
  const text = [
    record.status,
    record.statusSignIn,
    record.statusSignOut,
    record.source?.status,
    record.source?.attendance_status,
    record.source?.details,
    record.source?.type,
    record.source?.holiday_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    text.includes('weekend') ||
    text.includes('weekly off') ||
    text.includes('weekly holiday') ||
    text.includes('ہفتہ وار چھٹی') ||
    text.includes('ÛÙØªÛ ÙˆØ§Ø± Ú†Ú¾Ù¹ÛŒ') ||
    text.includes('Ú†Ú¾Ù¹ÛŒ')
  );
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

function calculateSummary(records, monthInfo) {
  const totalDays = getDaysInMonth(monthInfo.month, monthInfo.year);
  const weekends = records.filter(isWeekend).length;
  const attendanceRecords = records.filter((record) => !isAbsent(record) && !isLeave(record) && !isWeekend(record));
  const lateRecords = attendanceRecords.filter(isLate);
  const earlyLeaveRecords = attendanceRecords.filter((record) => Number(record.earlyLeaveMinutes || 0) > 0);
  const lateDays = lateRecords.length;
  const lateMinutes = lateRecords.reduce((total, record) => total + Number(record.lateMinutes || 0), 0);
  const earlyLeaveDays = earlyLeaveRecords.length;
  const earlyLeaveMinutes = earlyLeaveRecords.reduce((total, record) => total + Number(record.earlyLeaveMinutes || 0), 0);
  const absents = records.filter(isAbsent).length;
  const leaveRecords = records.filter(isLeave);
  const leaves = leaveRecords.length;
  const workingDays = Math.max(totalDays - weekends, 0);
  const presentDays = attendanceRecords.filter(isPresent).length;
  const onTimeDays = Math.max(presentDays - lateDays, 0);

  return {
    totalDays,
    weekends,
    workingDays,
    presentDays,
    absents,
    leaves,
    onTimeDays,
    lateDays,
    lateTotalText: formatMinutes(lateMinutes),
    earlyLeaveDays,
    earlyLeaveTotalText: formatMinutes(earlyLeaveMinutes),
    leaveReasons: leaveRecords
      .filter((record) => record.leaveReason)
      .map((record) => ({
        date: record.date,
        reason: record.leaveReason,
      })),
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
  const [activeFilter, setActiveFilter] = useState('all');
  const visibleRules = attendanceRules.filter(
    (rule) => activeFilter === 'all' || rule.category === activeFilter
  );

  return (
    <View style={styles.rulesContainer}>
      <View style={styles.rulesHeader}>
        <Text style={styles.rulesTitle}>اصول و ضوابط</Text>
        <Text style={styles.rulesSubtitle}>
          نظم و ضبط کی بہتری کے لئے تمام عملہ و اساتذہ ان ہدایات پر عمل کرنے کے پابند ہیں۔
        </Text>
      </View>

      <View style={styles.ruleFilterBar}>
        {ruleFilters.map((filter) => {
          const selected = activeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              accessibilityRole="button"
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.ruleFilter, selected && styles.activeRuleFilter]}
            >
              <Text style={[styles.ruleFilterText, selected && styles.activeRuleFilterText]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {visibleRules.map((rule) => (
        <View key={rule.id} style={styles.ruleItem}>
          <View style={styles.ruleNumberBox}>
            <Text style={styles.ruleNumber}>{rule.id}</Text>
          </View>
          <View style={styles.ruleBody}>
            <Text style={styles.ruleItemTitle}>{rule.title}</Text>
            <Text style={styles.ruleText}>{rule.text}</Text>
          </View>
        </View>
      ))}

      <View style={styles.rulesNote}>
        <Text style={styles.rulesNoteText}>
          ایک ضروری گزارش ہے کہ درخواست صرف وہی قابل قبول ہوگی جو مندرجہ بالا طریقہ کار کے مطابق مرکزی دفتر انتظامیہ سے منظور ہوگی۔ نظم و ضبط کی بہتری کے لئے مذکورہ طریقہ کار کا اہتمام فرمائیں۔ جزاکم اللہ خیرا
        </Text>
      </View>
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

  const summary = useMemo(() => calculateSummary(records, previousMonth), [previousMonth, records]);

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
  rulesContainer: {
    gap: spacing.md,
  },
  rulesHeader: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  rulesTitle: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rulesSubtitle: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 30,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ruleFilterBar: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ruleFilter: {
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRuleFilter: {
    backgroundColor: colors.cream,
    borderColor: colors.cream,
  },
  ruleFilterText: {
    color: colors.creamMuted,
    fontFamily: font.bold,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  activeRuleFilterText: {
    color: colors.primaryDark,
  },
  ruleItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  ruleNumberBox: {
    width: 38,
    minHeight: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumber: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  ruleBody: {
    flex: 1,
    gap: 4,
  },
  ruleItemTitle: {
    color: colors.white,
    fontFamily: font.bold,
    fontSize: 17,
    lineHeight: 31,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ruleText: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 31,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rulesNote: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.creamMuted,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
  },
  rulesNoteText: {
    color: colors.white,
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 31,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
