import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Download, RefreshCw } from 'lucide-react-native';
import { CURRENT_VERSION_NAME, GITHUB_DOWNLOAD_PAGE_URL } from '../config/appVersion';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

export default function UpdateRequiredScreen({ updateInfo, error, checking = false, onRetry }) {
  const updateAvailable = Boolean(updateInfo?.updateAvailable);
  const title = updateAvailable ? 'ایپ اپڈیٹ کریں' : 'ورژن چیک نہیں ہو سکا';
  const message = updateAvailable
    ? 'اس ایپ کا نیا ورژن دستیاب ہے۔ نیا ورژن انسٹال کیے بغیر ایپ استعمال نہیں ہو سکتی۔'
    : 'براہ کرم انٹرنیٹ کنکشن چیک کریں اور دوبارہ کوشش کریں۔';

  const openUpdatePage = async () => {
    const url = updateInfo?.downloadUrl || GITHUB_DOWNLOAD_PAGE_URL;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Download link', url);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.panel}>
        <Text style={styles.appName}>DT Attendance</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.versionBox}>
          <Text style={styles.versionText}>موجودہ ورژن: {CURRENT_VERSION_NAME}</Text>
          {updateInfo?.latestVersionName || updateInfo?.latestVersion ? (
            <Text style={styles.versionText}>
              نیا ورژن: {updateInfo.latestVersionName || updateInfo.latestVersion}
            </Text>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {updateAvailable ? (
          <Pressable accessibilityRole="button" onPress={openUpdatePage} style={styles.button}>
            <Download color={colors.cream} size={23} />
            <Text style={styles.buttonText}>نیا ورژن ڈاؤنلوڈ کریں</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" disabled={checking} onPress={onRetry} style={styles.button}>
            <RefreshCw color={colors.cream} size={23} />
            <Text style={styles.buttonText}>{checking ? 'چیک ہو رہا ہے...' : 'دوبارہ چیک کریں'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 480,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  appName: {
    color: colors.creamMuted,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
  },
  title: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 26,
    lineHeight: 42,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  message: {
    color: colors.creamMuted,
    fontFamily: font.regular,
    fontSize: 16,
    lineHeight: 31,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  versionBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
    gap: spacing.xs,
  },
  versionText: {
    color: colors.white,
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 27,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  errorText: {
    color: colors.danger,
    fontFamily: font.bold,
    fontSize: 14,
    lineHeight: 25,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  button: {
    minHeight: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 17,
    lineHeight: 30,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
