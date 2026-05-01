import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BadgeCheck, CalendarDays, Filter, Fingerprint, LogOut, MousePointerClick } from 'lucide-react-native';
import Header from '../components/Header';
import Screen from '../components/Screen';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

const steps = [
  {
    icon: BadgeCheck,
    title: 'لاگ اِن کا طریقہ',
    text: 'ایپ کھولیں، اپنا شناختی کارڈ نمبر اور ملازم کا شناختی نمبر درج کریں، پھر لاگ اِن کریں۔',
  },
  {
    icon: Fingerprint,
    title: 'CNIC اور Employee ID',
    text: 'شناختی کارڈ نمبر وہی درج کریں جو آپ کے ریکارڈ میں موجود ہے۔ Employee ID بھی درست نمبروں کے ساتھ لکھیں۔',
  },
  {
    icon: CalendarDays,
    title: 'روزانہ کی حاضری',
    text: 'ڈیش بورڈ سے میری حاضری منتخب کریں۔ موجودہ ماہ کی تاریخ، وقتِ آمد، وقتِ روانگی اور اسٹیٹس نظر آئے گا۔',
  },
  {
    icon: Filter,
    title: 'فلٹر کے ساتھ ماہانہ ریکارڈ',
    text: 'ماہانہ ریکارڈ میں مہینہ اور سال منتخب کریں، پھر ریکارڈ دیکھیں کا بٹن دبائیں۔',
  },
  {
    icon: MousePointerClick,
    title: 'بٹنوں کا استعمال',
    text: 'ہر بٹن بڑا اور واضح ہے۔ جس حصے میں جانا ہو اسی بٹن کو ایک بار دبائیں۔',
  },
  {
    icon: LogOut,
    title: 'لاگ آؤٹ کا طریقہ',
    text: 'اوپر موجود لاگ آؤٹ آئیکن دبائیں۔ اس کے بعد دوبارہ داخل ہونے کے لیے معلومات پھر درج کریں۔',
  },
];

export default function HowToUseScreen({ navigation }) {
  return (
    <Screen scroll={false}>
      <Header title="ایپ استعمال کرنے کا طریقہ" navigation={navigation} canGoBack />
      <ScrollView contentContainerStyle={styles.list}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <View key={step.title} style={styles.card}>
              <View style={styles.iconWrap}>
                <Icon color={colors.cream} size={24} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{step.title}</Text>
                <Text style={styles.text}>{step.text}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 18,
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  text: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 29,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
