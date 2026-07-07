from domains.ai.domain.repositories.ai_repository import AIProvider


class OpenAIClient(AIProvider):

    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ):

        raise NotImplementedError(
            "OpenAI ainda não implementado."
        )