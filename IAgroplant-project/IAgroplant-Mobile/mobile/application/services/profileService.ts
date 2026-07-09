import { UserProfile, UpdateProfileInput } from '../../domain/entities/profile.types';
import { IProfileRepository } from '../../domain/repositories/ProfileRepository';
import { get, put, uploadFile } from '../../infrastructure/api/api';

// ─── LOCAL MOCK STATE ─────────────────────────────────────────────────────────
// Em caso de falha de conexão (ex: servidor Django offline), o aplicativo
// utiliza essa memória local para garantir que a demonstração funcione perfeitamente.

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

// ─── IMPLEMENTATION ───────────────────────────────────────────────────────────

export class ProfileService implements IProfileRepository {

  setMockProfile(profile: UserProfile) {
    LOCAL_PROFILE = profile;
  }

  async getMe(): Promise<UserProfile> {
    try {
      const data = await get('/users/me');
      if (data && data.id) {
        LOCAL_PROFILE = data;
        return data;
      }
    } catch (e) {
      console.log('Backend indisponível, servindo perfil local...');
    }

    return LOCAL_PROFILE;
  }

  async updateMe(input: UpdateProfileInput): Promise<UserProfile> {
    try {
      const data = await put('/users/me', input);
      if (data && data.id) {
        LOCAL_PROFILE = data;
        return data;
      }
    } catch (e) {
      console.log('Backend indisponível, atualizando perfil localmente...');
    }

    LOCAL_PROFILE = {
      ...LOCAL_PROFILE,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.region !== undefined ? { region: input.region } : {}),
      ...(input.especialidades !== undefined ? { especialidades: input.especialidades } : {}),
    };
    return LOCAL_PROFILE;
  }

  async uploadPhoto(uri: string): Promise<UserProfile> {
    try {
      const data = await uploadFile('/users/me/photo', uri, 'photo');
      if (data && data.id) {
        LOCAL_PROFILE = data;
        return data;
      }
    } catch (e) {
      console.log('Backend indisponível, aplicando foto localmente...');
    }

    LOCAL_PROFILE = { ...LOCAL_PROFILE, photo_url: uri };
    return LOCAL_PROFILE;
  }
}

export const profileService = new ProfileService();
