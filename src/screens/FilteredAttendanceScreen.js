import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Search, Minus, Plus } from 'lucide-react-native';
import AppButton from '../components/AppButton';
import AttendanceCard from '../components/AttendanceCard';
import Header from '../components/Header';
import MessageBox from '../components/MessageBox';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { getAttendance } from '../services/api';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

const months = [
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

export default function FilteredAttendanceScreen({ navigation }) {
  const { user } = useAuth();
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const data = await getAttendance(user.employeeId, user.idCard, { month, year });
      setRecords(data);
    } catch {
      setError('فلٹر کے ساتھ ریکارڈ لوڈ نہیں ہو سکا۔ دوبارہ کوشش کریں۔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <Header title="ماہانہ ریکارڈ" navigation={navigation} canGoBack />

      <View style={styles.filters}>
        <Text style={styles.label}>مہینہ</Text>
        <View style={styles.monthGrid}>
          {months.map((name, index) => {
            const value = index + 1;
            const selected = value === month;
            return (
              <Pressable
                key={name}
                accessibilityRole="button"
                onPress={() => setMonth(value)}
                style={[styles.monthButton, selected && styles.monthSelected]}
              >
                <Text style={[styles.monthText, selected && styles.monthTextSelected]} numberOfLines={1}>
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>سال</Text>
        <View style={styles.yearControl}>
          <Pressable style={styles.stepper} onPress={() => setYear((value) => value + 1)}>
            <Plus color={colors.cream} size={20} />
          </Pressable>
          <Text style={styles.year}>{year}</Text>
          <Pressable style={styles.stepper} onPress={() => setYear((value) => value - 1)}>
            <Minus color={colors.cream} size={20} />
          </Pressable>
        </View>

        <AppButton title="ریکارڈ دیکھیں" icon={Search} loading={loading} onPress={search} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.cream} size="large" />
          <Text style={styles.loading}>ریکارڈ لوڈ ہو رہا ہے...</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <AttendanceCard item={item} />}
          ListHeaderComponent={<MessageBox message={error} type="error" />}
          ListEmptyComponent={
            searched && !error ? <Text style={styles.empty}>منتخب ماہ کا ریکارڈ دستیاب نہیں۔</Text> : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  monthGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  monthButton: {
    width: '30.8%',
    minHeight: 42,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  monthSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.cream,
  },
  monthText: {
    color: colors.creamMuted,
    fontFamily: font.bold,
    fontSize: 13,
    lineHeight: 24,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  monthTextSelected: {
    color: colors.cream,
  },
  yearControl: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  stepper: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  year: {
    minWidth: 92,
    color: colors.white,
    fontFamily: font.bold,
    fontSize: 22,
    lineHeight: 36,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loading: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 17,
    lineHeight: 30,
    writingDirection: 'rtl',
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  empty: {
    color: colors.creamMuted,
    fontFamily: font.bold,
    fontSize: 17,
    lineHeight: 31,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingTop: spacing.xl,
  },
});
