import { DiagnosticRecord } from "../entities/diagnostic-history.entity";

export interface IDiagnosticHistoryRepository {

    getMine(): Promise<DiagnosticRecord[]>;

    delete(recordId: string): Promise<void>;

}