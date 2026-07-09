import { useState, useEffect, useCallback } from 'react';
import { PendingDiagnosticRecord } from '../../../domain/entities/diagnostic-history.entity';
import { ListPendingDiagnosticsUseCase } from '../../../application/use-cases/ListPendingDiagnosticsUseCase';
import { ConfirmDiagnosticUseCase } from '../../../application/use-cases/ConfirmDiagnosticUseCase';
import { diagnosticReviewRepository } from '../../../application/services/diagnosticReviewService';

const listPendingDiagnosticsUseCase = new ListPendingDiagnosticsUseCase(diagnosticReviewRepository);
const confirmDiagnosticUseCase = new ConfirmDiagnosticUseCase(diagnosticReviewRepository);

export function useDiagnosticReview() {
  const [records, setRecords] = useState<PendingDiagnosticRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listPendingDiagnosticsUseCase.execute();
      setRecords(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm(recordId: string): Promise<boolean> {
    setIsConfirming(true);
    setError(null);
    try {
      await confirmDiagnosticUseCase.execute(recordId);
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Não foi possível confirmar o diagnóstico.');
      return false;
    } finally {
      setIsConfirming(false);
    }
  }

  return { records, isLoading, isConfirming, error, confirm, refresh: load };
}
