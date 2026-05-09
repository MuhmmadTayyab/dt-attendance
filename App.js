import React, { useCallback, useEffect, useState } from 'react';
import { I18nManager, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import UpdateRequiredScreen from './src/components/UpdateRequiredScreen';
import { colors } from './src/theme/colors';
import { checkForAppUpdate } from './src/services/version';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CurrentAttendanceScreen from './src/screens/CurrentAttendanceScreen';
import FilteredAttendanceScreen from './src/screens/FilteredAttendanceScreen';
import HowToUseScreen from './src/screens/HowToUseScreen';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.cream,
    border: colors.border,
    primary: colors.cream,
  },
};

function AppNavigator() {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <View style={styles.loadingRoot}>
        <Text style={styles.loadingText}>ایپ لوڈ ہو رہی ہے...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_left',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="CurrentAttendance" component={CurrentAttendanceScreen} />
            <Stack.Screen name="FilteredAttendance" component={FilteredAttendanceScreen} />
            <Stack.Screen name="HowToUse" component={HowToUseScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function UpdateGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [error, setError] = useState('');

  const checkVersion = useCallback(async () => {
    setChecking(true);
    setError('');

    try {
      const info = await checkForAppUpdate();
      setUpdateInfo(info);
    } catch {
      setError('ورژن چیک کرنے میں مسئلہ آ رہا ہے۔');
      setUpdateInfo(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

  if (checking && !updateInfo) {
    return (
      <View style={styles.loadingRoot}>
        <Text style={styles.loadingText}>ورژن چیک ہو رہا ہے...</Text>
      </View>
    );
  }

  if (error || (updateInfo?.updateAvailable && updateInfo?.forceUpdate)) {
    return <UpdateRequiredScreen updateInfo={updateInfo} error={error} checking={checking} onRetry={checkVersion} />;
  }

  return children;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
  });

  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingRoot}>
        <Text style={styles.loadingText}>فونٹ لوڈ ہو رہا ہے...</Text>
      </View>
    );
  }

  return (
    <UpdateGate>
      <AuthProvider>
        <StatusBar style="light" backgroundColor={colors.background} />
        <AppNavigator />
      </AuthProvider>
    </UpdateGate>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.cream,
    fontFamily: 'NotoNaskhArabic_700Bold',
    fontSize: 18,
    writingDirection: 'rtl',
  },
});
