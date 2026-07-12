export interface Specialist {
  id: string;
  name: string;
  region: string | null;
  especialidades: string[];
  certificado: boolean;
  photo_url: string | null;
  reputacao: number;
}