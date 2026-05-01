import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { font, radius } from '../theme/layout';

export default function LogoMark({ size = 72, showName = false }) {
  return (
    <View style={styles.wrapper}>
      <Image
        source={require('../../assets/icon.png')}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.2),
          },
        ]}
        resizeMode="contain"
      />
      {showName ? <Text style={styles.name}>DT Attendance</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  image: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    color: colors.cream,
    fontFamily: font.bold,
    fontSize: 20,
    letterSpacing: 0,
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
  },
});
