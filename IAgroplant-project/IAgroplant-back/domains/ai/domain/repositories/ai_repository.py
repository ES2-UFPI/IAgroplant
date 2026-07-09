from abc import ABC, abstractmethod


class AIProvider(ABC):

    @abstractmethod
    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ):
        pass