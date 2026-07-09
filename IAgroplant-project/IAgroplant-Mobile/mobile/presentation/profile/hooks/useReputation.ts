import { useState, useEffect, useCallback } from 'react';
import { ReputationSummary } from '../../../domain/entities/reputation.entity';
import { GetReputationSummaryUseCase } from '../../../application/use-cases/GetReputationSummaryUseCase';
import { reputationRepository } from '../../../application/services/reputationService';

const getReputationSummaryUseCase = new GetReputationSummaryUseCase(reputationRepository);

export function useReputation() {
  const [summary, setSummary] = useState<ReputationSummary>({ total: 0, entries: [] });
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getReputationSummaryUseCase.execute();
      setSummary(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { summary, isLoading, refresh: load };
}
