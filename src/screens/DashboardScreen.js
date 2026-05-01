import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarCheck, CalendarSearch, HelpCircle } from 'lucide-react-native';
import AppButton from '../components/AppButton';
import Header from '../components/Header';
import Screen from '../components/Screen';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

export default function DashboardScreen({ navigation }) {
  return (
    <Screen scroll={false}>
      <Header title="ڈیش بورڈ" navigation={navigation} />

      <View style={styles.panel}>
        <Text style={styles.heading}>خوش آمدید</Text>
        <Text style={styles.copy}>اپنی حاضری دیکھنے کے لیے نیچے سے مطلوبہ حصہ منتخب کریں۔</Text>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="میری حاضری (موجودہ ماہ)"
          icon={CalendarCheck}
          onPress={() => navigation.navigate('CurrentAttendance')}
          style={styles.actionButton}
        />
        <AppButton
          title="ماہانہ ریکارڈ (فلٹر کے ساتھ)"
          icon={CalendarSearch}
          onPress={() => navigation.navigate('FilteredAttendance')}
          style={styles.actionButton}
        />
        <AppButton
          title="ایپ استعمال کرنے کا طریقہ"
          icon={HelpCircle}
          onPress={() => navigation.navigate('HowToUse')}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  heading: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 25,
    lineHeight: 42,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  copy: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 16,
    lineHeight: 30,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  actionButton: {
    minHeight: 76,
  },
});
