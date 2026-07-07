export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  region: string | null;
  certificado: boolean;
  especialidades: string[];
  photo_url: string | null;
}

export interface UpdateProfileInput {
  name?: string;
  region?: string;
  especialidades?: string[];
}
