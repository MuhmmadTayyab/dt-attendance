import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginStaff } from '../services/api';

const STORAGE_KEY = 'dt-attendance-user';
const EMPLOYEE_ID_KEY = 'dt-attendance-employee-id';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setUser(JSON.parse(saved));
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setRestoring(false);
      }
    }

    restoreSession();
  }, []);

  const signIn = async ({ employeeId, idCard }) => {
    setLoading(true);
    try {
      const profile = await loginStaff(employeeId, idCard);
      const nextUser = { employeeId, idCard, profile };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      await AsyncStorage.setItem(EMPLOYEE_ID_KEY, employeeId);
      setUser(nextUser);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, EMPLOYEE_ID_KEY]);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, restoring, loading, signIn, signOut }),
    [user, restoring, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
