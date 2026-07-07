from domains.diagnosis.domain.entities.diagnostic_result import DiagnosticResult


class ResponseFormatter:


    @staticmethod
    def format(
        text
    ) -> DiagnosticResult:


        if isinstance(text, dict):

            text = (
                text.get("text")
                or
                text.get("response")
                or
                str(text)
            )


        pathogen = "Desconhecido"

        severity = "Não informado"

        management = text



        for line in text.splitlines():

            if line.lower().startswith(
                "patógeno"
            ):

                pathogen = line.split(
                    ":",
                    1
                )[1].strip()



            elif line.lower().startswith(
                "severidade"
            ):

                severity = line.split(
                    ":",
                    1
                )[1].strip()



            elif line.lower().startswith(
                "manejo"
            ):

                management = line.split(
                    ":",
                    1
                )[1].strip()



        return DiagnosticResult(

            pathogen=pathogen,

            severity=severity,

            management=management,

            confidence=0.80,

            technical_warning=(
                "Este diagnóstico é apenas auxiliar "
                "e não substitui um laudo técnico."
            )
        )