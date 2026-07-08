from abc import ABC
from abc import abstractmethod

from domains.diagnosis.domain.entities.diagnostic_result import DiagnosticResult


class DiagnosisRepository(ABC):

    @abstractmethod
    def diagnose(
        self,
        prompt: str,
        image: bytes,
    ) -> DiagnosticResult:
        pass