import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  TextInput,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../auth/LoginScreen';
import { FeedScreen } from '../feed/FeedScreen';
import { ProfileScreen } from '../profile/ProfileScreen';
import { ProfileEditScreen } from '../profile/ProfileEditScreen';
import { DiagnosticHistoryScreen } from '../profile/DiagnosticHistoryScreen';
import { DiagnosticReviewScreen } from '../profile/DiagnosticReviewScreen';
import { ConnectionsScreen } from '../connections/ConnectionsScreen';
import { OpportunitiesScreen } from '../opportunities/OpportunitiesScreen';
import DiagnosticScreen from "../screens/DiagnosticScreen";
import { ChatScreen } from '../chat/ChatScreen';
import { NotificationsScreen } from '../notifications/NotificationsScreen';
import MyDiagnosticsScreen from "../screens/MyDiagnosticsScreen";
const Stack = createNativeStackNavigator();

type Account = {
  name: string;
  role: string;
  email: string;
  emoji: string;
  color: string;
};

const ACCOUNTS: Account[] = [
  { name: 'João', role: 'Produtor Rural', email: 'joao.agro@exemplo.com', emoji: '🚜', color: '#B45309' },
  { name: 'Arthur', role: 'Estudante', email: 'arthur.estudante@exemplo.com', emoji: '🎓', color: '#16A34A' },
  { name: 'Cláudio', role: 'Técnico', email: 'tecnico.agro@exemplo.com', emoji: '🔧', color: '#2563EB' },
];

// ─── ROLE SELECTION SCREEN (SELECT PROFILE WITH PREMIUM BG) ─────────────────
function RoleSelectionScreen({ navigation }: any) {
  const { signIn, updateRole } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!selectedAccount) return;
    setIsLoggingIn(true);
    try {
      // Simula a chamada de login do AuthContext
      await signIn(selectedAccount.email, 'password123');
      // Garante que o papel do usuário seja exatamente o selecionado
      await updateRole(selectedAccount.role);
      // Navega para as abas principais
      navigation.replace('MainTabs');
    } catch (e) {
      alert('Erro de conexão ao realizar login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/agro_bg.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay}>

        {/* Título Principal */}
        <View style={styles.roleSelectionHeader}>
          <Text style={styles.selectionTitle}>IAgroplant</Text>
          <Text style={styles.selectionSubtitle}>
            {selectedAccount ? 'Acesso à Conta Salva' : 'Escolha uma conta para entrar'}
          </Text>
        </View>

        {!selectedAccount ? (
          /* Lista de Contas Salvas */
          <View style={styles.rolesGrid}>
            {ACCOUNTS.map((acc) => (
              <TouchableOpacity
                key={acc.email}
                style={styles.roleCircleCard}
                activeOpacity={0.85}
                onPress={() => setSelectedAccount(acc)}
              >
                <View style={[styles.roleCircle, { backgroundColor: acc.color }]}>
                  <Text style={styles.roleCircleEmoji}>{acc.emoji}</Text>
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.roleCircleName}>{acc.name}</Text>
                  <Text style={styles.roleCircleRole}>{acc.role}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Formulário de Login Pré-Preenchido */
          <View style={styles.loginFormContainer}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={[styles.roleCircle, { backgroundColor: selectedAccount.color, width: 72, height: 72, borderRadius: 36 }]}>
                <Text style={[styles.roleCircleEmoji, { fontSize: 32 }]}>{selectedAccount.emoji}</Text>
              </View>
              <Text style={styles.loginFormName}>{selectedAccount.name}</Text>
              <Text style={styles.loginFormRole}>{selectedAccount.role}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={[styles.inputField, { opacity: 0.8 }]}
                value={selectedAccount.email}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
              <TextInput
                style={[styles.inputField, { opacity: 0.8 }]}
                value="••••••••••••••"
                secureTextEntry
                editable={false}
              />
            </View>

            <TouchableOpacity
              style={styles.loginSubmitBtn}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              <Text style={styles.loginSubmitBtnText}>
                {isLoggingIn ? 'Entrando...' : `Entrar como ${selectedAccount.name}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBackBtn}
              activeOpacity={0.85}
              onPress={() => setSelectedAccount(null)}
            >
              <Text style={styles.loginBackBtnText}>Voltar e escolher outra conta</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.selectionFooter}>Contas locais integradas ao dispositivo</Text>
      </View>
    </ImageBackground>
  );
}

// ─── MAIN TAB NAVIGATOR (BOTTOM TABS + GEMINI FAB) ─────────────────────────
function MainTabNavigator({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState<'feed' | 'opportunities' | 'chat' | 'profile'>('feed');

  React.useEffect(() => {
    if (route.params?.screen) {
      setActiveTab(route.params.screen);

      // Se tiver parâmetros extras de inicialização da aba, propaga para as rotas
      if (route.params?.initialTab && route.params?.screen === 'opportunities') {
        // Redireciona os parâmetros para a rotaOpportunities
        navigation.setParams({ initialTab: route.params.initialTab });
      }
    }
  }, [route.params?.screen, route.params?.initialTab]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Sub-screen rendering */}
      <View style={{ flex: 1 }}>
        {activeTab === 'feed' && <FeedScreen navigation={navigation} />}
        {activeTab === 'opportunities' && <OpportunitiesScreen navigation={navigation} />}
        {activeTab === 'chat' && <ChatScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* FLOATING ACTION BUTTON - GEMINI CO-PILOT (AI DIAGNOSTIC) */}
      <TouchableOpacity
        style={styles.geminiFAB}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Diagnostic')}
      >
        <View style={styles.geminiFABInner}>
          <Text style={styles.geminiFABEmoji}>✨</Text>
        </View>
      </TouchableOpacity>

      {/* CUSTOM BOTTOM TAB BAR */}
      <View style={styles.bottomTabBar}>
        {/* Tab Feed */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabIcon, activeTab === 'feed' && styles.tabIconActive]}>🌱</Text>
          <Text style={[styles.tabLabel, activeTab === 'feed' && styles.tabLabelActive]}>Feed</Text>
        </TouchableOpacity>

        {/* Tab Opportunities */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('opportunities')}
        >
          <Text style={[styles.tabIcon, activeTab === 'opportunities' && styles.tabIconActive]}>🗺️</Text>
          <Text style={[styles.tabLabel, activeTab === 'opportunities' && styles.tabLabelActive]}>Vagas</Text>
        </TouchableOpacity>

        {/* Tab Chat */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabIcon, activeTab === 'chat' && styles.tabIconActive]}>💬</Text>
          <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>Chat</Text>
        </TouchableOpacity>

        {/* Tab Profile */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabIconActive]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.subtitle}>Carregando sessão...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="ProfileEdit"
              component={ProfileEditScreen}
              options={{ title: 'Editar Perfil' }}
            />

            <Stack.Screen
              name="DiagnosticHistory"
              component={DiagnosticHistoryScreen}
              options={{ title: 'Histórico de Diagnósticos' }}
            />

            <Stack.Screen
              name="DiagnosticReview"
              component={DiagnosticReviewScreen}
              options={{ title: 'Confirmar Diagnósticos' }}
            />

            <Stack.Screen
              name="Connections"
              component={ConnectionsScreen}
              options={{ title: 'Conexões' }}
            />

            <Stack.Screen
              name="Diagnostic"
              component={DiagnosticScreen}
              options={{ title: 'Diagnóstico IA' }}
            />
            <Stack.Screen

                name="MyDiagnostics"

                component={MyDiagnosticsScreen}

                options={{

                title:"Meus Diagnósticos"

                }}

                />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: 'Notificações' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginTop: 10,
  },
  // Selection Screen Styles
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.78)', // overlay azul escuro premium
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  roleSelectionHeader: { alignItems: 'center', marginTop: 15 },
  selectionTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  selectionSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34D399',
    marginTop: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rolesGrid: { gap: 16, width: '100%', paddingHorizontal: 10, justifyContent: 'center', flex: 1 },
  roleCircleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
  },
  roleCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  roleCircleEmoji: { fontSize: 24 },
  roleCircleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  roleCircleRole: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  selectionFooter: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Login Form Styles (Prefilled flow)
  loginFormContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20,
  },
  loginFormName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: 10,
  },
  loginFormRole: {
    fontSize: 13,
    color: '#34D399',
    marginTop: 2,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputField: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  loginSubmitBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#16A34A',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  loginSubmitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  loginBackBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  loginBackBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },

  // Custom Tab Bar styles
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    height: 60,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabIcon: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  tabIconActive: {
    color: '#16A34A',
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#16A34A',
    fontWeight: '700',
  },

  // Gemini FLOATING ACTION BUTTON
  geminiFAB: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 999,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  geminiFABInner: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: '#1E1B4B', // fundo violeta/azul escuro profundo
    borderWidth: 1.5,
    borderColor: '#3B82F6', // borda azul neon
    alignItems: 'center',
    justifyContent: 'center',
  },
  geminiFABEmoji: { fontSize: 24, textShadowColor: '#3B82F6', textShadowRadius: 6 },
});
