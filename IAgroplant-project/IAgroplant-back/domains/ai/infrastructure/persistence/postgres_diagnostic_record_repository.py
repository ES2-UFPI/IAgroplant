from typing import List, Optional
from domains.ai.domain.entities.diagnostic_record import DiagnosticRecord
from domains.ai.domain.repositories.diagnostic_record_repository import DiagnosticRecordRepository


class PostgresDiagnosticRecordRepository(DiagnosticRecordRepository):
    # In-memory storage to serve as a mock/stub that simulates a database table.
    _records: List[DiagnosticRecord] = []

    def save(self, record: DiagnosticRecord) -> DiagnosticRecord:
        for idx, r in enumerate(PostgresDiagnosticRecordRepository._records):
            if r.id == record.id:
                PostgresDiagnosticRecordRepository._records[idx] = record
                return record
        PostgresDiagnosticRecordRepository._records.insert(0, record)
        return record

    def get_by_id(self, record_id: str) -> Optional[DiagnosticRecord]:
        for r in PostgresDiagnosticRecordRepository._records:
            if r.id == record_id:
                return r
        return None

    def list_by_user(self, user_id: str) -> List[DiagnosticRecord]:
        return [r for r in PostgresDiagnosticRecordRepository._records if r.user_id == user_id]

    def list_pending_confirmation(self) -> List[DiagnosticRecord]:
        return [r for r in PostgresDiagnosticRecordRepository._records if not r.confirmed]
