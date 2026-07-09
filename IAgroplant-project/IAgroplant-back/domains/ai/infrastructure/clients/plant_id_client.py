import requests

from decouple import config

from domains.ai.domain.repositories.ai_repository import AIProvider


class PlantIDClient(AIProvider):

    def __init__(self):

        self.api_key = config("PLANT_ID_API_KEY")

        self.url = (
            "https://plant.id/api/v3/identification"
        )


    def diagnose(
        self,
        image: bytes,
        prompt: str = "",
    ):

        headers = {
            "Api-Key": self.api_key
        }


        files = {
            "images": (
                "plant.jpg",
                image,
                "image/jpeg"
            )
        }


        data = {
            "details": "disease"
        }


        response = requests.post(
            self.url,
            headers=headers,
            files=files,
            data=data,
            timeout=30
        )


        response.raise_for_status()


        result = response.json()


        return self._parse_result(result)



    def _parse_result(self, result):

        suggestions = (
            result
            .get("result", {})
            .get("disease", {})
            .get("suggestions", [])
        )


        if not suggestions:
            return {
                "pathogen": "Não identificado",
                "confidence": 0
            }


        disease = suggestions[0]


        return {

            "pathogen": disease.get(
                "name",
                "Desconhecido"
            ),

            "confidence": disease.get(
                "probability",
                0
            )

        }