import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LogIn } from 'lucide-react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import LogoMark from '../components/LogoMark';
import MessageBox from '../components/MessageBox';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { font, spacing } from '../theme/layout';

export default function LoginScreen() {
  const [employeeId, setEmployeeId] = useState('');
  const [idCard, setIdCard] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();

  const submit = async () => {
    const cleanEmployeeId = employeeId.trim();
    const cleanIdCard = idCard.trim();

    if (!cleanIdCard || !cleanEmployeeId) {
      setError('براہ کرم شناختی کارڈ نمبر اور ملازم کا شناختی نمبر درج کریں۔');
      return;
    }

    setError('');
    try {
      await signIn({ employeeId: cleanEmployeeId, idCard: cleanIdCard });
    } catch (err) {
      setError(err?.message || 'لاگ اِن نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کریں۔');
    }
  };

  return (
    <Screen centered>
      <View style={styles.logoArea}>
        <LogoMark size={92} showName />
        <Text style={styles.subtitle}>اسٹاف حاضری ایپ</Text>
      </View>

      <View style={styles.form}>
        <AppInput
          label="شناختی کارڈ نمبر"
          value={idCard}
          onChangeText={setIdCard}
          placeholder="مثلاً 35202-1234567-1"
          keyboardType="default"
        />
        <AppInput
          label="ملازم کا شناختی نمبر"
          value={employeeId}
          onChangeText={setEmployeeId}
          placeholder="اپنا Employee ID درج کریں"
          keyboardType="number-pad"
        />
        <MessageBox message={error} type="error" />
        <AppButton title="لاگ اِن کریں" icon={LogIn} loading={loading} onPress={submit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  subtitle: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 16,
    lineHeight: 29,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  form: {
    gap: spacing.md,
  },
});
