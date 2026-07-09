import { DiagnosticRecord } from '../../domain/entities/diagnostic-history.entity';
import { IDiagnosticReviewRepository } from '../../domain/repositories/DiagnosticReviewRepository';

// ─── CONFIRM DIAGNOSTIC USE CASE ──────────────────────────────────────────────
// Caso de uso para um profissional certificado confirmar o diagnóstico de
// outro usuário, disparando a premiação de reputação no backend.

export class ConfirmDiagnosticUseCase {
  constructor(private readonly repository: IDiagnosticReviewRepository) {}

  async execute(recordId: string): Promise<DiagnosticRecord> {
    return this.repository.confirm(recordId);
  }
}
