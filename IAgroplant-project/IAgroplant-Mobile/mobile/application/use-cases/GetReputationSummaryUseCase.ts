import { ReputationSummary } from '../../domain/entities/reputation.entity';
import { IReputationRepository } from '../../domain/repositories/ReputationRepository';

// ─── GET REPUTATION SUMMARY USE CASE ──────────────────────────────────────────
// Caso de uso para buscar o total e o histórico de reputação do usuário logado.
// Recebe o repositório por injeção de dependência (Dependency Inversion).

export class GetReputationSummaryUseCase {
  constructor(private readonly repository: IReputationRepository) {}

  async execute(): Promise<ReputationSummary> {
    return this.repository.getMySummary();
  }
}
