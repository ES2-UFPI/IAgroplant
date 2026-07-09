from abc import ABC, abstractmethod
from typing import List, Optional
from domains.ai.domain.entities.diagnostic_record import DiagnosticRecord


class DiagnosticRecordRepository(ABC):

    @abstractmethod
    def save(self, record: DiagnosticRecord) -> DiagnosticRecord:
        pass

    @abstractmethod
    def get_by_id(self, record_id: str) -> Optional[DiagnosticRecord]:
        pass

    @abstractmethod
    def list_by_user(self, user_id: str) -> List[DiagnosticRecord]:
        pass

    @abstractmethod
    def list_pending_confirmation(self) -> List[DiagnosticRecord]:
        pass
