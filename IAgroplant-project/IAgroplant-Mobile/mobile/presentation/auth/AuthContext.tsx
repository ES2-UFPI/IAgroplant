import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../application/services/AuthService';
import { profileService } from '../../application/services/profileService';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (role: string) => Promise<void>;
};

const STORAGE_KEY = '@iagroplant/auth-user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEFAULT_USER: AuthUser = {
  id: 'demo-user',
  name: 'João Agricultor',
  email: 'joao.agro@exemplo.com',
  role: 'Produtor Rural',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (isMounted && storedUser) {
          setUser(JSON.parse(storedUser) as AuthUser);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    signIn: async (email: string, password: string) => {
      try {
        const response = await login(email.trim().toLowerCase(), password);
        if (response && response.access_token) {
          await AsyncStorage.setItem('@iagroplant/auth-token', response.access_token);
          if (response.refresh_token) {
            await AsyncStorage.setItem('@iagroplant/auth-refresh-token', response.refresh_token);
          }
          const profile = await profileService.getMe();
          const authUser: AuthUser = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          };
          setUser(authUser);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          return;
        }
      } catch (error) {
        console.warn('Real sign in failed, falling back to mock login.', error);
      }

      // Fallback
      const nextUser = {
        ...DEFAULT_USER,
        email: email.trim().toLowerCase(),
        id: `demo-${Date.now()}`,
      };

      setUser(nextUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      await AsyncStorage.setItem('@iagroplant/auth-token', 'mock-token');
    },
    signOut: async () => {
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    },
    updateRole: async (role: string) => {
      if (user) {
        const updated = { ...user, role };
        setUser(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    },
  }), [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}