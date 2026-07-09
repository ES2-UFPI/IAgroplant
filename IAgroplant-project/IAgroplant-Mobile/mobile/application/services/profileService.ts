import {
  UserProfile,
  UpdateProfileInput,
} from '../../domain/entities/profile.types';

import { IProfileRepository } from '../../domain/repositories/ProfileRepository';

import {
  get,
  put,
  uploadFile,
} from '../../infrastructure/api/api';

let LOCAL_PROFILE: UserProfile = {
  id: 'demo-user',
  name: 'João Agricultor',
  email: 'joao.agro@exemplo.com',
  role: 'Produtor Rural',
  region: '',
  certificado: false,
  especialidades: [],
  photo_url: null,
  reputacao: 0,
};

export class ProfileService implements IProfileRepository {

  setMockProfile(profile: UserProfile) {
    LOCAL_PROFILE = profile;
  }

  async getMe(): Promise<UserProfile> {

    try {

      const data = await get('/users/me');

      LOCAL_PROFILE = data;

      return data;

    } catch (error: any) {

      console.log('Erro ao obter perfil');
      console.log(error.response?.status);
      console.log(error.response?.data);

      // Se o backend respondeu, repassa o erro.
      if (error.response) {
        throw error;
      }

      // Apenas quando realmente estiver offline
      console.log('Backend offline. Utilizando perfil local.');

      return LOCAL_PROFILE;
    }
  }

  async updateMe(
    input: UpdateProfileInput
  ): Promise<UserProfile> {

    try {

      const data = await put('/users/me', input);

      LOCAL_PROFILE = data;

      return data;

    } catch (error: any) {

      console.log('Erro ao atualizar perfil');
      console.log(error.response?.status);
      console.log(error.response?.data);

      if (error.response) {
        throw error;
      }

      LOCAL_PROFILE = {
        ...LOCAL_PROFILE,
        ...(input.name !== undefined && { name: input.name }),
        ...(input.region !== undefined && { region: input.region }),
        ...(input.especialidades !== undefined && {
          especialidades: input.especialidades,
        }),
      };

      return LOCAL_PROFILE;
    }
  }

  async uploadPhoto(
    uri: string
  ): Promise<UserProfile> {

    try {

      const data = await uploadFile(
        '/users/me/photo',
        uri,
        'photo'
      );

      LOCAL_PROFILE = data;

      return data;

    } catch (error: any) {

      console.log('Erro ao enviar foto');
      console.log(error.response?.status);
      console.log(error.response?.data);

      if (error.response) {
        throw error;
      }

      LOCAL_PROFILE = {
        ...LOCAL_PROFILE,
        photo_url: uri,
      };

      return LOCAL_PROFILE;
    }
  }
}

export const profileService = new ProfileService();