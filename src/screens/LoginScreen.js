import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Download, LogIn } from 'lucide-react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import LogoMark from '../components/LogoMark';
import MessageBox from '../components/MessageBox';
import Screen from '../components/Screen';
import { CURRENT_VERSION_NAME, GITHUB_DOWNLOAD_PAGE_URL } from '../config/appVersion';
import { useAuth } from '../context/AuthContext';
import { checkForAppUpdate } from '../services/version';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

const SAVED_LOGIN_KEY = 'dt-attendance-saved-login';

function maskEmployeeId(value) {
  if (!value) return '';
  const visible = value.slice(-3);
  return `${'*'.repeat(Math.max(value.length - 3, 0))}${visible}`;
}

export default function LoginScreen() {
  const [idCard, setIdCard] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showEmployeeId, setShowEmployeeId] = useState(false);
  const [error, setError] = useState('');
  const [updateInfo, setUpdateInfo] = useState(null);
  const { signIn, loading } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function loadSavedCredentials() {
      try {
        const saved = await AsyncStorage.getItem(SAVED_LOGIN_KEY);
        if (!saved || !mounted) return;

        const parsed = JSON.parse(saved);
        setIdCard(parsed.idCard || '');
        setEmployeeId(parsed.employeeId || '');
      } catch {
        await AsyncStorage.removeItem(SAVED_LOGIN_KEY);
      }
    }

    // Keep this screen locally LTR and prefill saved credentials without changing app-wide RTL.
    loadSavedCredentials();

    async function loadUpdateInfo() {
      try {
        const info = await checkForAppUpdate();
        if (mounted) setUpdateInfo(info);
      } catch {
        if (mounted) setUpdateInfo(null);
      }
    }

    loadUpdateInfo();

    return () => {
      mounted = false;
    };
  }, []);

  const openUpdatePage = async () => {
    const url = updateInfo?.downloadUrl || GITHUB_DOWNLOAD_PAGE_URL;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Update', url);
    }
  };

  const submit = async () => {
    const cleanIdCard = idCard.trim();
    const cleanEmployeeId = employeeId.trim();

    if (!cleanIdCard || !cleanEmployeeId) {
      setError('براہ کرم شناختی کارڈ نمبر اور ملازم کا شناختی نمبر درج کریں۔');
      return;
    }

    setError('');

    try {
      await signIn({ employeeId: cleanEmployeeId, idCard: cleanIdCard });

      // Store only the required login fields locally; never log or expose these values.
      await AsyncStorage.setItem(
        SAVED_LOGIN_KEY,
        JSON.stringify({ idCard: cleanIdCard, employeeId: cleanEmployeeId }),
      );
    } catch {
      Alert.alert('Invalid login');
      setError('Invalid login');
    }
  };

  return (
    <Screen centered>
      <View style={styles.loginRoot}>
        <View style={styles.logoArea}>
          <LogoMark size={92} showName />
          <Text style={styles.versionText}>ورژن {CURRENT_VERSION_NAME}</Text>
          <Text style={styles.subtitle}>اسٹاف حاضری ایپ</Text>
        </View>

        <View style={styles.form}>
          {updateInfo?.updateAvailable ? (
            <View style={styles.updateBox}>
              <Text style={styles.updateTitle}>نیا ورژن دستیاب ہے</Text>
              <Text style={styles.updateText}>
                نیا ورژن: {updateInfo.latestVersionName || updateInfo.latestVersion}
              </Text>
              <AppButton
                title="نیا ورژن انسٹال کریں"
                icon={Download}
                variant="secondary"
                onPress={openUpdatePage}
                style={styles.updateButton}
              />
            </View>
          ) : null}
          <AppInput
            label="شناختی کارڈ نمبر"
            value={idCard}
            onChangeText={setIdCard}
            placeholder="مثلاً 35202-1234567-1"
            keyboardType="default"
            textAlign="left"
            labelStyle={styles.ltrLabel}
            inputStyle={styles.ltrInput}
            inputRowStyle={styles.ltrInputRow}
          />
          <AppInput
            label="ملازم کا شناختی نمبر"
            value={employeeId}
            onChangeText={setEmployeeId}
            placeholder="Employee ID"
            keyboardType="number-pad"
            secureTextEntry={!showEmployeeId}
            textAlign="left"
            labelStyle={styles.ltrLabel}
            inputStyle={styles.ltrInput}
            inputRowStyle={styles.ltrInputRow}
            accessoryStyle={styles.ltrAccessory}
            accessory={
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowEmployeeId((visible) => !visible)}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleText}>{showEmployeeId ? 'Hide' : 'Show'}</Text>
              </Pressable>
            }
          />
          {!showEmployeeId && employeeId ? (
            <Text style={styles.maskText}>Saved Employee ID: {maskEmployeeId(employeeId)}</Text>
          ) : null}
          <MessageBox message={error} type="error" />
          <AppButton title="لاگ اِن کریں" icon={LogIn} loading={loading} onPress={submit} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loginRoot: {
    width: '100%',
    direction: 'ltr',
    writingDirection: 'ltr',
  },
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
  versionText: {
    color: colors.creamMuted,
    fontFamily: font.bold,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  form: {
    direction: 'ltr',
    gap: spacing.md,
  },
  updateBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cream,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
    gap: spacing.xs,
  },
  updateTitle: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  updateText: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  updateButton: {
    marginTop: spacing.xs,
  },
  ltrLabel: {
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  ltrInput: {
    writingDirection: 'ltr',
  },
  ltrInputRow: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  ltrAccessory: {
    paddingRight: spacing.sm,
    paddingLeft: 0,
  },
  toggleButton: {
    minWidth: 62,
    minHeight: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  toggleText: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 13,
  },
  maskText: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
});
