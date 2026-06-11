import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function ProfileEditScreen() {
  const navigation = useNavigation();

  // Estados simples para os inputs
  const [name, setName] = useState('João Agricultor');
  const [email, setEmail] = useState('joao.agro@exemplo.com');

  const handleSave = () => {
    // Aqui no futuro ficará a chamada para a API (Application/Domain)
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Informações</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName}
          placeholder="Seu nome"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Seu e-mail"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
