import { DiagnosticRecord, PendingDiagnosticRecord } from '../entities/diagnostic-history.entity';

export interface IDiagnosticReviewRepository {
  listPending(): Promise<PendingDiagnosticRecord[]>;
  confirm(recordId: string): Promise<DiagnosticRecord>;
}
