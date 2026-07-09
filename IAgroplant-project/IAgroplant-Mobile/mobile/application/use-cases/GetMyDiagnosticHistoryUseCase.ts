import { DiagnosticRecord } from '../../domain/entities/diagnostic-history.entity';
import { IDiagnosticHistoryRepository } from '../../domain/repositories/DiagnosticHistoryRepository';

// ─── GET MY DIAGNOSTIC HISTORY USE CASE ───────────────────────────────────────
// Caso de uso para buscar o histórico de diagnósticos do usuário logado.
// Recebe o repositório por injeção de dependência (Dependency Inversion).

export class GetMyDiagnosticHistoryUseCase {
  constructor(private readonly repository: IDiagnosticHistoryRepository) {}

  async execute(): Promise<DiagnosticRecord[]> {
    return this.repository.getMine();
  }
}
