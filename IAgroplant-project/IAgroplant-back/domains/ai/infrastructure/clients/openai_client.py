from domains.ai.domain.repositories.ai_repository import AIRepository


class OpenAIClient(AIRepository):

    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ):

        raise NotImplementedError(
            "OpenAI ainda não implementado."
        )