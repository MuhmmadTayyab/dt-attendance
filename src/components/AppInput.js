import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  textAlign = 'right',
  labelStyle,
  inputStyle,
  inputRowStyle,
  accessoryStyle,
  accessory,
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View style={[styles.inputRow, inputRowStyle]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.creamMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={[styles.input, inputStyle]}
          textAlign={textAlign}
          textAlignVertical="center"
          selectionColor={colors.cream}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {accessory ? <View style={[styles.accessory, accessoryStyle]}>{accessory}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputRow: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    direction: 'rtl',
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 56,
    color: colors.white,
    fontFamily: font.regular,
    fontSize: 17,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    writingDirection: 'rtl',
  },
  accessory: {
    paddingRight: spacing.sm,
  },
});
