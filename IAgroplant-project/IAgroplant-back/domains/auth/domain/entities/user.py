from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class User:
    id: str
    email: str
    name: str
    role: str = "user"
    is_active: bool = True
    password_hash: Optional[str] = None
    region: Optional[str] = None
    certificado: bool = False
    especialidades: List[str] = field(default_factory=list)
    photo_url: Optional[str] = None
    initial_guidance_completed: bool = False
    interactive_onboarding_completed: bool = False

    def is_valid(self) -> bool:
        return bool(self.email and self.id and self.is_active)
