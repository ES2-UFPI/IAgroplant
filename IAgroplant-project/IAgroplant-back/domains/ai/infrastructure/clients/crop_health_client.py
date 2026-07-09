import requests

from decouple import config

from domains.ai.domain.repositories.ai_repository import AIProvider


class CropHealthClient(AIProvider):


    def __init__(self):

        self.api_key = config(
            "CROP_HEALTH_API_KEY"
        )


        self.url = (
            "https://crop.kindwise.com/api/v1/identification"
        )



    def diagnose(
        self,
        image: str,
        prompt: str = "",
    ):


        response = requests.post(

            self.url,

            headers={
                "Api-Key": self.api_key,
                "Content-Type": "application/json"
            },


            json={

                "images": [
                    image
                ],

                "details": [
                    "description",
                    "treatment",
                    "symptoms",
                    "severity"
                ]

            },


            timeout=60
        )


        print(
            "CROP HEALTH STATUS:",
            response.status_code
        )


        print(
            "CROP HEALTH RESPONSE:",
            response.text
        )


        if response.status_code != 200:

            return {

                "pathogen": "Erro na API Crop Health",

                "confidence": 0,

                "severity": None,

                "treatment": response.text

            }


        return self._parse_result(
            response.json()
        )



    def _parse_result(
        self,
        result
    ):


        disease = (
            result
            .get("result", {})
            .get("disease", {})
        )


        suggestions = (
            disease
            .get("suggestions", [])
        )


        if not suggestions:

            return {

                "pathogen": "Não identificado",

                "confidence": 0,

                "severity": None,

                "treatment": None

            }



        first = suggestions[0]


        details = first.get(
            "details",
            {}
        )


        return {


            "pathogen": first.get(
                "name",
                "Desconhecido"
            ),


            "confidence": first.get(
                "probability",
                0
            ),


            "severity": details.get(
                "severity"
            ),


            "treatment": details.get(
                "treatment"
            )

        }