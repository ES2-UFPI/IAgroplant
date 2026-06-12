import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProfileAvatar } from './components/ProfileAvatar';

export function ProfileScreen() {
  const navigation = useNavigation<any>();

  // Mock de dados do usuário
  const user = {
    name: 'João Agricultor',
    email: 'joao.agro@exemplo.com',
    role: 'Produtor Rural',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProfileAvatar name={user.name} size={100} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Dados de Contato</Text>
        <Text style={styles.infoText}>E-mail: {user.email}</Text>
      </View>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => navigation.navigate('ProfileEdit')}
      >
        <Text style={styles.editButtonText}>Editar Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
  },
  editButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
