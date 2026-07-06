from domains.ai.domain.repositories.ai_repository import AIRepository


class GeminiClient(AIRepository):

    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ):

        raise NotImplementedError(
            "Gemini ainda não implementado."
        )