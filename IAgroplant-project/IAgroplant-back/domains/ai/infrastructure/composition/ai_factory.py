from decouple import config

from domains.ai.infrastructure.clients.fake_ai_client import FakeAIClient

from domains.ai.infrastructure.clients.openai_client import OpenAIClient

from domains.ai.infrastructure.clients.gemini_client import GeminiClient


class AIFactory:

    @staticmethod
    def create():

        provider = config(
            "AI_PROVIDER",
            default="fake"
        ).lower()

        if provider == "fake":

            return FakeAIClient()

        if provider == "openai":

            return OpenAIClient()

        if provider == "gemini":

            return GeminiClient()

        raise Exception(
            f"Provider '{provider}' inválido."
        )