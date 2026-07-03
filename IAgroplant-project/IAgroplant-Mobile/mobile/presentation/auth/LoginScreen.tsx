import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from './AuthContext';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('joao.agro@exemplo.com');
  const [password, setPassword] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Informe e-mail e senha para continuar.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
    } catch {
      setError('Não foi possível entrar agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrapper}
      >
        <View style={styles.card}>
          <Text style={styles.badge}>IAgroplant</Text>
          <Text style={styles.title}>Acesse sua conta</Text>
          <Text style={styles.subtitle}>Entre para ver o feed, oportunidades e o seu perfil.</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            secureTextEntry
            placeholderTextColor="#6B7280"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F8F2',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DDE8D8',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    color: '#166534',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#102A12',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: '#4B5563',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FAFAF9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#111827',
  },
  error: {
    color: '#B91C1C',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#166534',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});