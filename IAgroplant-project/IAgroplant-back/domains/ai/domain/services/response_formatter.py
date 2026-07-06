from domains.ai.domain.entities.diagnostic import Diagnostic


class ResponseFormatter:

    @staticmethod
    def format(
        raw: dict,
    ) -> Diagnostic:

        return Diagnostic(

            pathogen=raw["pathogen"],

            severity=raw["severity"],

            management=raw["management"],

            technical_warning=(
                "Resultado auxiliar. "
                "Não substitui laudo técnico."
            ),
        )