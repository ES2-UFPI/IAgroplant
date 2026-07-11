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
            Patógeno: Ferrugem Asiática

            Severidade: Alta

            Manejo:
            Aplicar fungicida triazol e monitorar semanalmente.

            Aviso Técnico:
            Realizar inspeção das folhas inferiores.
            """,

            """
            Patógeno: Oídio

            Severidade: Baixa

            Manejo:
            Melhorar ventilação e utilizar enxofre.

            Aviso Técnico:
            Evitar excesso de umidade.
            """,

            """
            Patógeno: Deficiência de Nitrogênio

            Severidade: Média

            Manejo:
            Realizar adubação nitrogenada.

            Aviso Técnico:
            Avaliar análise de solo.
            """

        ]

        return choice(diagnostics)