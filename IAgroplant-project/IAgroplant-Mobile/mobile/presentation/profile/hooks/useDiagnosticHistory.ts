import { useState, useEffect, useCallback } from 'react';
import { DiagnosticRecord } from '../../../domain/entities/diagnostic-history.entity';
import { GetMyDiagnosticHistoryUseCase } from '../../../application/use-cases/GetMyDiagnosticHistoryUseCase';
import { diagnosticHistoryRepository } from '../../../application/services/diagnosticHistoryService';

const getMyDiagnosticHistoryUseCase = new GetMyDiagnosticHistoryUseCase(diagnosticHistoryRepository);

export function useDiagnosticHistory() {
  const [records, setRecords] = useState<DiagnosticRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyDiagnosticHistoryUseCase.execute();
      setRecords(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { records, isLoading, refresh: load };
}
