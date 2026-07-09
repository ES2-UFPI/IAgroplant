import base64

from openai import OpenAI

from domains.ai.domain.repositories.ai_repository import AIProvider

#modelo da openai não foi usado porque necessita de tokens então retorna "erro"

class OpenAIClient(AIProvider):

    def __init__(self):

        self.client = OpenAI()


    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ):

        if isinstance(image, str):

            encoded_image = image

        else:

            encoded_image = base64.b64encode(
                image
            ).decode("utf-8")


        response = self.client.chat.completions.create(

            model="gpt-4.1-mini",

            messages=[

                {
                    "role": "system",
                    "content": """
Você é um especialista em diagnóstico agrícola.

Analise imagens de plantas.

Responda obrigatoriamente neste formato:

Pathogen: nome da doença ou problema

Severity: Baixa, Média ou Alta

Management: recomendações de manejo
"""
                },

                {
                    "role": "user",
                    "content": [

                        {
                            "type": "text",
                            "text": prompt
                        },

                        {
                            "type": "image_url",
                            "image_url": {
                                "url": (
                                    "data:image/jpeg;base64,"
                                    f"{encoded_image}"
                                )
                            }
                        }

                    ]
                }

            ],

            max_tokens=500
        )


        return (
            response
            .choices[0]
            .message
            .content
        )