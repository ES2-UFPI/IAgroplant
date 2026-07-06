from abc import ABC
from abc import abstractmethod

from domains.ai.domain.entities.diagnostic import Diagnostic


class AIRepository(ABC):

    @abstractmethod
    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ) -> Diagnostic:
        pass