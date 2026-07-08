from dataclasses import dataclass


@dataclass
class Diagnostic:

    pathogen: str

    severity: str

    management: str

    technical_warning: str