from abc import ABC, abstractmethod


class AIProvider(ABC):


    @abstractmethod
    def diagnose(
        self,
        image: str,
        prompt: str,
    ):
        pass