import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AttendanceCard from '../components/AttendanceCard';
import Header from '../components/Header';
import MessageBox from '../components/MessageBox';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { getAttendance } from '../services/api';
import { colors } from '../theme/colors';
import { font, spacing } from '../theme/layout';

export default function CurrentAttendanceScreen({ navigation }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await getAttendance(user.employeeId, user.idCard);
      setRecords(data);
    } catch {
      setError('حاضری کا ریکارڈ لوڈ نہیں ہو سکا۔ انٹرنیٹ کنکشن چیک کریں۔');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.employeeId, user.idCard]);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load]),
  );

  return (
    <Screen scroll={false}>
      <Header title="میری حاضری" navigation={navigation} canGoBack />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.cream} size="large" />
          <Text style={styles.loading}>حاضری لوڈ ہو رہی ہے...</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <AttendanceCard item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={colors.cream}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={<MessageBox message={error} type="error" />}
          ListEmptyComponent={!error ? <Text style={styles.empty}>موجودہ ماہ کا ریکارڈ دستیاب نہیں۔</Text> : null}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
