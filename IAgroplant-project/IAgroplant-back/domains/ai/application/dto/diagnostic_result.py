from dataclasses import dataclass


@dataclass
class DiagnosticResult:

    pathogen: str

    severity: str

    management: str

    technical_warning: str