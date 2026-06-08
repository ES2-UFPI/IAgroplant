from dataclasses import dataclass
from typing import Optional


@dataclass
class User:
    id: str
    email: str
    name: str
    role: str = "user"
    is_active: bool = True
    password_hash: Optional[str] = None

    def is_valid(self) -> bool:
        return bool(self.email and self.id and self.is_active)
