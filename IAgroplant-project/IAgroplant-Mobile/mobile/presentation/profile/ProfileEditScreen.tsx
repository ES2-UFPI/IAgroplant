import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from './ProfileViewModel';
import { ProfileAvatar } from './components/ProfileAvatar';
import { SpecialtiesInput } from './components/SpecialtiesInput';

export function ProfileEditScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile, isLoading, isSaving, saveProfile, changePhoto, refresh } = useProfile();

  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [especialidades, setEspecialidades] = useState<string[]>([]);

  // Garante que o formulário sempre comece da versão mais recente conhecida
  // do perfil, mesmo se esta tela ficou montada em memória desde uma visita
  // anterior (mesmo motivo do useFocusEffect em ProfileScreen).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRegion(profile.region ?? '');
      setEspecialidades(profile.especialidades);
    }
  }, [profile]);

  const email = profile?.email ?? user?.email ?? '';

  async function handleSave() {
    const ok = await saveProfile({ name, region, especialidades });
    if (ok) {
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      navigation.goBack();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    }
  }

  async function handleChangePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const ok = await changePhoto(result.assets[0].uri);
      if (!ok) {
        Alert.alert('Erro', 'Não foi possível atualizar a foto. Tente novamente.');
      }
    }
  }

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Editar Informações</Text>

      <View style={styles.avatarSection}>
        <ProfileAvatar name={name || 'Usuário'} size={90} photoUrl={profile?.photo_url} />
        <TouchableOpacity onPress={handleChangePhoto} style={styles.photoButton}>
          <Text style={styles.photoButtonText}>Trocar foto</Text>
        </TouchableOpacity>
      </View>

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
        <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} />
        <Text style={styles.helperText}>O e-mail não pode ser alterado por aqui.</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Região</Text>
        <TextInput
          style={styles.input}
          value={region}
          onChangeText={setRegion}
          placeholder="Ex: Piauí"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Especialidades</Text>
        <SpecialtiesInput value={especialidades} onChange={setEspecialidades} />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  photoButtonText: {
    color: '#2e7d32',
    fontSize: 13,
    fontWeight: '700',
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
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
