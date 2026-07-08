from dataclasses import dataclass


@dataclass(frozen=True)
class DiagnosisRequest:

    image_bytes: bytes

    filename: str

    description: str