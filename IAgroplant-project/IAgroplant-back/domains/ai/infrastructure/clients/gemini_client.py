import os

from google import genai

from domains.ai.domain.repositories.ai_repository import AIProvider
#também existe limite de tokens para habilitar o funcionamento do a api gemini

class GeminiClient(AIProvider):

    def __init__(self):

        self.client = genai.Client(
            api_key=os.getenv(
                "GEMINI_API_KEY"
            )
        )


    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ):

        response = self.client.models.generate_content(
            model="gemini-2.0-flash",

            contents=[
                {
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": image,
                            }
                        },
                        {
                            "text": f"""
Você é um especialista em diagnóstico agrícola.

Analise a imagem da planta.

Responda obrigatoriamente neste formato:

Pathogen: nome da doença ou problema

Severity: Baixa, Média ou Alta

Management: recomendações de manejo


Descrição do produtor:

{prompt}
"""
                        }
                    ]
                }
            ]
        )


        return response.text