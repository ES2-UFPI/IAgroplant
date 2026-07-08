from dataclasses import dataclass


@dataclass
class DiagnosticInput:

    image_bytes: bytes

    description: str