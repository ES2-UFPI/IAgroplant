import { ReputationSummary } from '../entities/reputation.entity';

export interface IReputationRepository {
  getMySummary(): Promise<ReputationSummary>;
}
