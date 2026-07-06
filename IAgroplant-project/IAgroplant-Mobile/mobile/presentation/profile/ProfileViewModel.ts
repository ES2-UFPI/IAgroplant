import { useState, useEffect, useCallback } from 'react';
import { UserProfile, UpdateProfileInput } from '../../domain/entities/profile.types';
import { profileService } from '../../application/services/profileService';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getMe();
      setProfile(data);
    } catch (e) {
      setError('Não foi possível carregar o perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile(input: UpdateProfileInput): Promise<boolean> {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await profileService.updateMe(input);
      setProfile(updated);
      return true;
    } catch (e) {
      setError('Não foi possível salvar as alterações. Tente novamente.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function changePhoto(uri: string): Promise<boolean> {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await profileService.uploadPhoto(uri);
      setProfile(updated);
      return true;
    } catch (e) {
      setError('Não foi possível atualizar a foto. Tente novamente.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    profile,
    isLoading,
    isSaving,
    error,
    saveProfile,
    changePhoto,
    refresh: load,
  };
}
