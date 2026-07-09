import { ReputationSummary } from '../../domain/entities/reputation.entity';
import { IReputationRepository } from '../../domain/repositories/ReputationRepository';
import { get } from '../../infrastructure/api/api';

const EMPTY_SUMMARY: ReputationSummary = { total: 0, entries: [] };

export class ApiReputationService implements IReputationRepository {
  async getMySummary(): Promise<ReputationSummary> {
    try {
      const data = await get('/reputation/me');
      if (data && Array.isArray(data.entries)) {
        return data;
      }
    } catch (error: any) {
      console.log('Erro ao carregar reputação da API, exibindo vazio...', error.message);
    }
    return EMPTY_SUMMARY;
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────

export const reputationRepository: IReputationRepository = new ApiReputationService();
