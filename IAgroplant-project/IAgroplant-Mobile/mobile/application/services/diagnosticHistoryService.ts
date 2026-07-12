import { DiagnosticRecord } from "../../domain/entities/diagnostic-history.entity";
import { IDiagnosticHistoryRepository } from "../../domain/repositories/DiagnosticHistoryRepository";

import {
    get,
    api,
} from "../../infrastructure/api/api";

export class ApiDiagnosticHistoryService
implements IDiagnosticHistoryRepository {

    async getMine(): Promise<DiagnosticRecord[]> {

        try {

            const data = await get(
                "/diagnostics/me"
            );

            return Array.isArray(data)
                ? data
                : [];

        } catch {

            return [];

        }

    }

    async delete(
        recordId: string
    ): Promise<void> {

        await api.delete(

            `/diagnostics/${recordId}/delete`

        );

    }

}

export const diagnosticHistoryRepository =
    new ApiDiagnosticHistoryService();