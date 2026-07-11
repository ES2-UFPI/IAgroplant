from domains.diagnosis.domain.entities.diagnostic_result import DiagnosticResult


class ResponseFormatter:

    @staticmethod
    def format(text) -> DiagnosticResult:

        if isinstance(text, dict):

            text = (
                text.get("text")
                or text.get("response")
                or text.get("management")
                or str(text)
            )

        pathogen = "Desconhecido"
        severity = "Não informado"
        management = ""

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        current_field = None

        for line in lines:

            lower = line.lower()

            if lower.startswith("patógeno") or lower.startswith("pathogen"):

                value = line.split(":", 1)[1].strip()

                pathogen = value

                current_field = None


            elif lower.startswith("severidade") or lower.startswith("severity"):

                value = line.split(":", 1)[1].strip()

                severity = value

                current_field = None


            elif lower.startswith("manejo") or lower.startswith("management"):

                value = line.split(":", 1)[1].strip()

                if value:

                    management = value

                    current_field = None

                else:

                    current_field = "management"


            elif current_field == "management":

                management = line.strip()

                current_field = None


        return DiagnosticResult(

            pathogen=pathogen,

            severity=severity,

            management=management,

            confidence=0.80,

            technical_warning=(
                "Este diagnóstico é apenas auxiliar "
                "e não substitui um laudo técnico."
            ),

        )