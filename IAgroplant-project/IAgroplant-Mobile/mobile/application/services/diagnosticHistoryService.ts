import { DiagnosticRecord } from '../../domain/entities/diagnostic-history.entity';
import { IDiagnosticHistoryRepository } from '../../domain/repositories/DiagnosticHistoryRepository';
import { get } from '../../infrastructure/api/api';

export class ApiDiagnosticHistoryService implements IDiagnosticHistoryRepository {
  async getMine(): Promise<DiagnosticRecord[]> {
    try {
      const data = await get('/diagnostics/me');
      if (Array.isArray(data)) {
        return data;
      }
    } catch (error: any) {
      console.log('Erro ao carregar histórico de diagnósticos, exibindo vazio...', error.message);
    }
    return [];
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────

export const diagnosticHistoryRepository: IDiagnosticHistoryRepository = new ApiDiagnosticHistoryService();
