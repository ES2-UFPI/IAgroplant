import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSpecialistSearch } from './useSpecialistSearch';
import { Specialist } from '../../domain/entities/specialist.types';

export function SpecialistsScreen() {
  const [topic, setTopic] = useState('');
  const { results, isLoading, error, hasSearched, search } = useSpecialistSearch();

  function handleSearch() {
    search(topic);
  }

  function renderItem({ item }: { item: Specialist }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          {item.certificado && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✔ Certificado</Text>
            </View>
          )}
        </View>
        {item.region && <Text style={styles.region}>📍 {item.region}</Text>}
        <Text style={styles.especialidades}>
          {item.especialidades.join(' · ')}
        </Text>
        <Text style={styles.reputacao}>Reputação: {item.reputacao} pts</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Buscar especialistas</Text>
        <Text style={styles.helperText}>
          Encontre profissionais certificados por tema (ex: macaxeira, solo, pragas) para
          iniciar uma conversa no chat.
        </Text>

        <TextInput
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
          placeholder="Digite um tema..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={[styles.searchBtn, isLoading && styles.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={isLoading}
        >
          <Text style={styles.searchBtnText}>{isLoading ? 'Buscando...' : 'Buscar'}</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {isLoading ? (
          <ActivityIndicator size="large" color="#16A34A" style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
            ListEmptyComponent={
              hasSearched ? (
                <Text style={styles.emptyText}>
                  Nenhum especialista certificado encontrado para esse tema.
                </Text>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  helperText: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  searchBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchBtnDisabled: { opacity: 0.6 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorText: { color: '#DC2626', marginTop: 10, fontSize: 13 },
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  badge: { backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#15803D', fontWeight: '700' },
  region: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  especialidades: { fontSize: 14, color: '#374151', marginTop: 6 },
  reputacao: { fontSize: 12, color: '#9CA3AF', marginTop: 6 },
});