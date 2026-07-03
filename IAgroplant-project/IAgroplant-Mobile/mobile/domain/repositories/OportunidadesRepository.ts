import { Vaga, Candidatura } from '../entities/vaga.types';

export interface IOportunidadesRepository {
  getAll(filters: { region?: string; culture?: string; vacancy_type?: string }): Promise<Vaga[]>;
  apply(vacancyId: string, token: string): Promise<Candidatura>;
  create(vaga: Omit<Vaga, 'id' | 'created_at' | 'producer_id' | 'producer_name'>, token: string): Promise<Vaga>;
  getApplications(token: string): Promise<Candidatura[]>;
}
