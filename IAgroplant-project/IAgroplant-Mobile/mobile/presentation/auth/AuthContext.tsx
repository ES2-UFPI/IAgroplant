import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../application/services/AuthService';
import { profileService } from '../../application/services/profileService';
import { setOpportunitiesMockUser } from '../../application/services/oportunidadesService';

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

      // Fallback dinâmico com base no e-mail selecionado
      const emailLower = email.trim().toLowerCase();
      let mockName = 'Usuário';
      let mockRole = 'Estudante';
      
      if (emailLower.includes('joao')) {
        mockName = 'João Agricultor';
        mockRole = 'Produtor Rural';
      } else if (emailLower.includes('arthur')) {
        mockName = 'Arthur Estudante';
        mockRole = 'Estudante';
      } else if (emailLower.includes('tecnico')) {
        mockName = 'Cláudio';
        mockRole = 'Técnico';
      }

      const nextUser = {
        id: `demo-${emailLower.split('@')[0]}`,
        name: mockName,
        email: emailLower,
        role: mockRole,
      };

      setUser(nextUser);

      // Sincroniza o mock de perfil no profileService
      profileService.setMockProfile({
        id: nextUser.id,
        name: nextUser.name,
        email: nextUser.email,
        role: nextUser.role,
        region: 'Teresina, PI',
        certificado: mockRole === 'Técnico' || mockRole === 'Produtor Rural',
        especialidades: mockRole === 'Estudante' ? ['Soja', 'Milho', 'Fitopatologia'] : ['Manejo integrado', 'Consultoria'],
        photo_url: null,
      });

      // Sincroniza o mock user no oportunidadesService
      setOpportunitiesMockUser({
        id: nextUser.id,
        name: nextUser.name,
        role: nextUser.role,
      });

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

        // Sincroniza mocks locais
        setOpportunitiesMockUser({
          id: user.id,
          name: user.name,
          role: role,
        });

        try {
          const currentProfile = await profileService.getMe();
          profileService.setMockProfile({ ...currentProfile, role });
        } catch (e) {
          console.log('Erro ao atualizar mock de perfil em updateRole:', e);
        }
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