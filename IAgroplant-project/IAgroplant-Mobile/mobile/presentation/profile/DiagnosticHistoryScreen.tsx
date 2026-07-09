import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useDiagnosticHistory } from './hooks/useDiagnosticHistory';
import { DiagnosticRecord } from '../../domain/entities/diagnostic-history.entity';

function severityColor(severity: string) {
  if (severity === 'Alta') return '#DC2626';
  if (severity === 'Moderada') return '#D97706';
  return '#16A34A';
}

function DiagnosticRecordItem({ item }: { item: DiagnosticRecord }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pathogen}>{item.pathogen}</Text>
        <Text style={[styles.severity, { color: severityColor(item.severity) }]}>{item.severity}</Text>
      </View>
      <Text style={styles.management}>{item.management}</Text>
      <View style={styles.footerRow}>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
        {item.confirmed ? (
          <View style={styles.confirmedBadge}>
            <Text style={styles.confirmedBadgeText}>✓ Confirmado por agrônomo</Text>
          </View>
        ) : (
          <Text style={styles.pendingText}>Aguardando confirmação</Text>
        )}
      </View>
    </View>
  );
}

export function DiagnosticHistoryScreen() {
  const { records, isLoading, refresh } = useDiagnosticHistory();

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={refresh}
        renderItem={({ item }) => <DiagnosticRecordItem item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔬</Text>
            <Text style={styles.emptyTitle}>Nenhum diagnóstico realizado ainda</Text>
            <Text style={styles.emptySubtitle}>Use o "Novo Diagnóstico" na tela inicial para começar.</Text>
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
  management: { fontSize: 13, color: '#4B5563', marginTop: 8, lineHeight: 18 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  date: { fontSize: 11, color: '#9CA3AF' },
  confirmedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  confirmedBadgeText: { fontSize: 11, color: '#166534', fontWeight: '700' },
  pendingText: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
});
