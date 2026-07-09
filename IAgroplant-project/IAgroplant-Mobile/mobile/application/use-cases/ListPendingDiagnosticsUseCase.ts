import { PendingDiagnosticRecord } from '../../domain/entities/diagnostic-history.entity';
import { IDiagnosticReviewRepository } from '../../domain/repositories/DiagnosticReviewRepository';

// ─── LIST PENDING DIAGNOSTICS USE CASE ────────────────────────────────────────
// Caso de uso para profissionais certificados listarem diagnósticos de outros
// usuários aguardando confirmação.

export class ListPendingDiagnosticsUseCase {
  constructor(private readonly repository: IDiagnosticReviewRepository) {}

  async execute(): Promise<PendingDiagnosticRecord[]> {
    return this.repository.listPending();
  }
}
