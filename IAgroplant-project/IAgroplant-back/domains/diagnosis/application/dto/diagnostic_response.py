from dataclasses import dataclass


@dataclass
class DiagnosticResponse:

    pathogen: str

    severity: str

    recommendation: str

    warning: str