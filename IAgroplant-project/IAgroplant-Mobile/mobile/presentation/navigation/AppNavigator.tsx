import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../auth/LoginScreen';
import { FeedScreen } from '../feed/FeedScreen';
import { ProfileScreen } from '../profile/ProfileScreen';
import { ProfileEditScreen } from '../profile/ProfileEditScreen';
import { OpportunitiesScreen } from '../opportunities/OpportunitiesScreen';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao IAgroplant!</Text>
      <Text style={styles.subtitle}>{user?.name ?? 'Usuário'} está conectado.</Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#2e7d32' }]}
        onPress={() => navigation.navigate('Feed')}
      >
        <Text style={styles.buttonText}>Abrir Feed</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#0f766e', marginTop: 10 }]}
        onPress={() => navigation.navigate('Opportunities')}
      >
        <Text style={styles.buttonText}>Ver Oportunidades</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#d97706', marginTop: 10 }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Abrir Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#d32f2f', marginTop: 10 }]}
        onPress={() => signOut()}
      >
        <Text style={styles.buttonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
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
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Início' }} 
            />
            <Stack.Screen 
              name="Feed" 
              component={FeedScreen} 
              options={{ title: 'Feed' }} 
            />
            <Stack.Screen 
              name="Opportunities" 
              component={OpportunitiesScreen} 
              options={{ title: 'Oportunidades' }} 
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ title: 'Meu Perfil' }} 
            />
            <Stack.Screen 
              name="ProfileEdit" 
              component={ProfileEditScreen} 
              options={{ title: 'Editar Perfil' }} 
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2e7d32', 
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
});