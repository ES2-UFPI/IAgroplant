import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useDiagnosticReview } from './hooks/useDiagnosticReview';
import { PendingDiagnosticRecord } from '../../domain/entities/diagnostic-history.entity';

function severityColor(severity: string) {
  if (severity === 'Alta') return '#DC2626';
  if (severity === 'Moderada') return '#D97706';
  return '#16A34A';
}

export function DiagnosticReviewScreen() {
  const { records, isLoading, isConfirming, confirm, refresh } = useDiagnosticReview();

  async function handleConfirm(item: PendingDiagnosticRecord) {
    const ok = await confirm(item.id);
    if (ok) {
      Alert.alert('Confirmado', `Diagnóstico de ${item.user_name} confirmado com sucesso!`);
    } else {
      Alert.alert('Erro', 'Não foi possível confirmar este diagnóstico.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={refresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.pathogen}>{item.pathogen}</Text>
              <Text style={[styles.severity, { color: severityColor(item.severity) }]}>{item.severity}</Text>
            </View>
            <Text style={styles.submitter}>Enviado por {item.user_name}</Text>
            <Text style={styles.management}>{item.management}</Text>
            <TouchableOpacity
              style={[styles.confirmBtn, isConfirming && styles.confirmBtnDisabled]}
              onPress={() => handleConfirm(item)}
              disabled={isConfirming}
            >
              <Text style={styles.confirmBtnText}>
                {isConfirming ? 'Confirmando...' : 'Confirmar diagnóstico'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyTitle}>Nenhum diagnóstico pendente</Text>
            <Text style={styles.emptySubtitle}>Diagnósticos de outros usuários aparecerão aqui para confirmação.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  listContainer: { padding: 16, gap: 12, flexGrow: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pathogen: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 },
  severity: { fontSize: 13, fontWeight: '700' },
  submitter: { fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '600' },
  management: { fontSize: 13, color: '#4B5563', marginTop: 8, lineHeight: 18 },
  confirmBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  confirmBtnDisabled: { opacity: 0.7 },
  confirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
});
