from typing import List
from domains.ai.domain.entities.diagnostic_record import DiagnosticRecord
from domains.ai.domain.repositories.diagnostic_record_repository import DiagnosticRecordRepository


class ListPendingDiagnosticsUseCase:

    def __init__(self, repository: DiagnosticRecordRepository):
        self._repo = repository

    def execute(self, exclude_user_id: str) -> List[DiagnosticRecord]:
        records = self._repo.list_pending_confirmation()
        records = [r for r in records if r.user_id != exclude_user_id]
        return sorted(records, key=lambda r: r.created_at)
