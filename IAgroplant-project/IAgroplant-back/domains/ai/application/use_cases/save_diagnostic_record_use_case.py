import uuid
from dataclasses import dataclass
from domains.ai.domain.entities.diagnostic_record import DiagnosticRecord
from domains.ai.domain.repositories.diagnostic_record_repository import DiagnosticRecordRepository


@dataclass
class SaveDiagnosticRecordInput:
    user_id: str
    pathogen: str
    severity: str
    management: str
    technical_warning: str


class SaveDiagnosticRecordUseCase:

    def __init__(self, repository: DiagnosticRecordRepository):
        self._repo = repository

    def execute(self, input_data: SaveDiagnosticRecordInput) -> DiagnosticRecord:
        record = DiagnosticRecord(
            id=str(uuid.uuid4()),
            user_id=input_data.user_id,
            pathogen=input_data.pathogen,
            severity=input_data.severity,
            management=input_data.management,
            technical_warning=input_data.technical_warning,
        )
        return self._repo.save(record)
