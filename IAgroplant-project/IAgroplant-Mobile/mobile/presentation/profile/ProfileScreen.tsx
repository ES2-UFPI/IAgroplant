import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ProfileAvatar } from './components/ProfileAvatar';
import { VerifiedBadge } from './components/VerifiedBadge';
import { SpecialtiesInput } from './components/SpecialtiesInput';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from './ProfileViewModel';
import { useOpportunities } from '../opportunities/OportunidadesViewModel';

const MAX_APPLICATIONS_PREVIEW = 3;

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuth();
  const { profile, isLoading, refresh } = useProfile();
  const { candidaturas } = useOpportunities();

  // O React Navigation mantém esta tela montada ao empilhar ProfileEdit por
  // cima; sem isso, voltar de lá mostraria dados desatualizados (o fetch do
  // useProfile só roda uma vez, no mount).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const name = profile?.name ?? user?.name ?? 'Usuário';
  const role = profile?.role ?? user?.role ?? 'Perfil sem dados';
  const email = profile?.email ?? user?.email ?? '-';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ProfileAvatar name={name} size={100} photoUrl={profile?.photo_url} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
        {profile?.region && <Text style={styles.region}>📍 {profile.region}</Text>}
        {profile?.certificado && <VerifiedBadge />}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Dados de Contato</Text>
        <Text style={styles.infoText}>E-mail: {email}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Especialidades</Text>
        <SpecialtiesInput value={profile?.especialidades ?? []} editable={false} />
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Histórico de Candidaturas</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'opportunities', initialTab: 'applications' })}
          >
            <Text style={styles.linkText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {candidaturas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma candidatura registrada ainda.</Text>
        ) : (
          candidaturas.slice(0, MAX_APPLICATIONS_PREVIEW).map((app) => (
            <View key={app.id} style={styles.applicationRow}>
              <Text style={styles.applicationTitle}>{app.vacancy_title || 'Vaga'}</Text>
              <Text style={styles.applicationStatus}>{app.status}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Histórico de Diagnósticos</Text>
        <Text style={styles.emptyText}>🔬 Em breve — funcionalidade em desenvolvimento.</Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('ProfileEdit')}
        disabled={isLoading}
      >
        <Text style={styles.editButtonText}>Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: '#B45309', marginTop: -10, marginBottom: 40 }]}
        onPress={async () => {
          await signOut();
        }}
        disabled={isLoading}
      >
        <Text style={styles.editButtonText}>🔄 Sair / Trocar de Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  region: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '700',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  applicationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
  },
  applicationTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  applicationStatus: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
