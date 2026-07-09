from decouple import config

from domains.ai.infrastructure.clients.fake_ai_client import FakeAIClient

from domains.ai.infrastructure.clients.openai_client import OpenAIClient

from domains.ai.infrastructure.clients.gemini_client import GeminiClient

from domains.ai.infrastructure.clients.plant_id_client import PlantIDClient

from domains.ai.infrastructure.clients.crop_health_client import CropHealthClient

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
        
        if provider == "plantid":

            return PlantIDClient()

        if provider == "crophealth":

            return CropHealthClient()
        
        raise Exception(
            f"Provider '{provider}' inválido."
        )