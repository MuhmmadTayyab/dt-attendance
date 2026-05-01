import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

export default function MessageBox({ message, type = 'info' }) {
  if (!message) return null;

  return (
    <View style={[styles.box, type === 'error' && styles.error]}>
      <Text style={[styles.text, type === 'error' && styles.errorText]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  error: {
    borderColor: colors.danger,
  },
  text: {
    color: colors.cream,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 27,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  errorText: {
    color: colors.danger,
    fontFamily: font.bold,
  },
});
