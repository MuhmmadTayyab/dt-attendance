import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, LogOut } from 'lucide-react-native';
import LogoMark from './LogoMark';
import { colors } from '../theme/colors';
import { font, radius, spacing } from '../theme/layout';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, navigation, canGoBack = false }) {
  const { signOut } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {canGoBack ? (
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowRight color={colors.cream} size={22} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        <LogoMark size={42} />
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
      </View>

      <View style={styles.side}>
        <Pressable accessibilityRole="button" onPress={signOut} style={styles.iconButton}>
          <LogOut color={colors.cream} size={21} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    minHeight: 58,
  },
  side: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 21,
    lineHeight: 34,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
