import {
    diagnosticHistoryRepository,
} from "../application/services/diagnosticHistoryService";

import {
    deleteDiagnostic,
} from "../application/services/DeleteDiagnosticService";

import {
    DiagnosticRecord,
} from "../domain/entities/diagnostic-history.entity";

export default class DiagnosticHistoryFacade {

    async getMine(): Promise<DiagnosticRecord[]> {

        return await diagnosticHistoryRepository.getMine();

    }

    async delete(
        id: string,
    ): Promise<void> {

        await deleteDiagnostic(id);

    }

}