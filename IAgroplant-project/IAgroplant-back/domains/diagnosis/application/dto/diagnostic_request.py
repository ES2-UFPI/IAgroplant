from dataclasses import dataclass


@dataclass
class DiagnosticRequest:

    image_base64: str

    description: str