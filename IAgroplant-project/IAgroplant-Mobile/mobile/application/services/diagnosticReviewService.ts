import { DiagnosticRecord, PendingDiagnosticRecord } from '../../domain/entities/diagnostic-history.entity';
import { IDiagnosticReviewRepository } from '../../domain/repositories/DiagnosticReviewRepository';
import { get, post } from '../../infrastructure/api/api';

export class ApiDiagnosticReviewService implements IDiagnosticReviewRepository {
  async listPending(): Promise<PendingDiagnosticRecord[]> {
    try {
      const data = await get('/diagnostics/pending');
      if (Array.isArray(data)) {
        return data;
      }
    } catch (error: any) {
      console.log('Erro ao carregar diagnósticos pendentes, exibindo vazio...', error.message);
    }
    return [];
  }

  async confirm(recordId: string): Promise<DiagnosticRecord> {
    return post(`/diagnostics/${recordId}/confirm`);
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────

export const diagnosticReviewRepository: IDiagnosticReviewRepository = new ApiDiagnosticReviewService();
