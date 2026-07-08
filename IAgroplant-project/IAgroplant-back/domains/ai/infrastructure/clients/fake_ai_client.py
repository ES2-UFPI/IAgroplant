from random import choice

from domains.ai.domain.repositories.ai_repository import AIProvider


class FakeAIClient(AIProvider):

    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ):

        diagnostics = [

            {
                "pathogen": "Ferrugem Asiática",
                "severity": "Alta",
                "management":
                    "Aplicar fungicida triazol e monitorar semanalmente."
            },

            {
                "pathogen": "Oídio",

                "severity": "Baixa",

                "management":
                    "Melhorar ventilação e utilizar enxofre."
            },

            {
                "pathogen": "Deficiência de Nitrogênio",

                "severity": "Média",

                "management":
                    "Realizar adubação nitrogenada."
            }

        ]
        result = choice(diagnostics)
        return f"""
            Pathogen: {result['pathogen']}
            Severity: {result['severity']}
            Management: {result['management']}
            """
        