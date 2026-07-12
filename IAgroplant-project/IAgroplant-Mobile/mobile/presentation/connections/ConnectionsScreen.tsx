import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useConnections } from './hooks/useConnections';
import { useProfile } from '../profile/ProfileViewModel';

export function ConnectionsScreen({ navigation }: any) {
  const { profile } = useProfile();
  const { pending, isSubmitting, sendRequest, accept, reject, refresh } = useConnections();
  const [targetUserId, setTargetUserId] = useState('');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function handleSend() {
    if (!targetUserId.trim()) return;
    const ok = await sendRequest(targetUserId.trim());
    if (ok) {
      Alert.alert('Enviado', 'Solicitação de conexão enviada com sucesso!');
      setTargetUserId('');
    } else {
      Alert.alert('Erro', 'Não foi possível enviar a solicitação. Confira o ID do usuário.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.searchSpecialistsBtn}
            onPress={() => navigation.navigate('Specialists')}
          >
            <Text style={styles.searchSpecialistsBtnText}>🔍 Buscar especialistas por tema</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Solicitar conexão</Text>
          <Text style={styles.helperText}>
            Prefere conectar diretamente? Informe o ID do usuário que deseja conectar (ex: peça
            para o profissional compartilhar o ID do perfil dele).
          </Text>
          <TextInput
            style={styles.input}
            value={targetUserId}
            onChangeText={setTargetUserId}
            placeholder="ID do usuário (ex: 1)"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.sendBtn, isSubmitting && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={isSubmitting}
          >
            <Text style={styles.sendBtnText}>{isSubmitting ? 'Enviando...' : 'Enviar solicitação'}</Text>
          </TouchableOpacity>
        </View>

        {profile?.certificado && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pedidos recebidos</Text>
            {pending.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma solicitação pendente.</Text>
            ) : (
              pending.map((conn) => (
                <View key={conn.id} style={styles.connCard}>
                  <Text style={styles.connName}>{conn.from_user_name}</Text>
                  <View style={styles.connActions}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => accept(conn.id)}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.acceptBtnText}>Aceitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => reject(conn.id)}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.rejectBtnText}>Rejeitar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, gap: 16 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  searchSpecialistsBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchSpecialistsBtnText: { color: '#1D4ED8', fontWeight: '700', fontSize: 14 },
  helperText: { fontSize: 12, color: '#9CA3AF', marginBottom: 12, lineHeight: 17 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
  },
  sendBtn: { backgroundColor: '#16A34A', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.7 },
  sendBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  connCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
  },
  connName: { fontSize: 14, fontWeight: '600', color: '#374151', flex: 1 },
  connActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: { backgroundColor: '#16A34A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  acceptBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  rejectBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  rejectBtnText: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
});