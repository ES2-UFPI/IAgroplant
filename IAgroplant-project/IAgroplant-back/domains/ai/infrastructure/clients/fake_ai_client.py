from random import choice

from domains.ai.domain.repositories.ai_repository import AIProvider


class FakeAIClient(AIProvider):

    def diagnose(
        self,
        image: bytes,
        prompt: str,
    ):

        diagnostics = [

            """
            Pathogen: Ferrugem Asiática

            Severity: Alta

            Management:
            Aplicar fungicida triazol e monitorar semanalmente.

            Technical Warning:
            Realizar inspeção das folhas inferiores.
            """,


            """
            Pathogen: Oídio

            Severity: Baixa

            Management:
            Melhorar ventilação e utilizar enxofre.

            Technical Warning:
            Evitar excesso de umidade.
            """,


            """
            Pathogen: Deficiência de Nitrogênio

            Severity: Média

            Management:
            Realizar adubação nitrogenada.

            Technical Warning:
            Avaliar análise de solo.
            """

        ]


        return choice(diagnostics)