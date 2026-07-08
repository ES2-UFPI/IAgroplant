from domains.ai.domain.repositories.ai_repository import AIProvider


class GeminiClient(AIProvider):

    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ):

        raise NotImplementedError(
            "Gemini ainda não implementado."
        )