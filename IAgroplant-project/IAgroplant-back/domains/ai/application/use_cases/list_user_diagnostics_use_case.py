from typing import List
from domains.ai.domain.entities.diagnostic_record import DiagnosticRecord
from domains.ai.domain.repositories.diagnostic_record_repository import DiagnosticRecordRepository


class ListUserDiagnosticsUseCase:

    def __init__(self, repository: DiagnosticRecordRepository):
        self._repo = repository

    def execute(self, user_id: str) -> List[DiagnosticRecord]:
        records = self._repo.list_by_user(user_id)
        return sorted(records, key=lambda r: r.created_at, reverse=True)
