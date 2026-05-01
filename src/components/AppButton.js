import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

export default function AppButton({ title, onPress, icon: Icon, loading = false, variant = 'primary', style }) {
  const secondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && styles.pressed,
        loading && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.cream} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon color={colors.cream} size={24} strokeWidth={2.4} /> : null}
          <Text style={styles.text} numberOfLines={2} adjustsFontSizeToFit>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.surfaceSoft,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  text: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 17,
    lineHeight: 30,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
