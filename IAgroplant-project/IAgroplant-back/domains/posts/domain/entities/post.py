from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional


@dataclass
class Post:
    id: str
    type: str  # 'simple', 'diagnostic', 'opportunity'
    content: str
    image_url: Optional[str]
    tags: List[str]
    author_id: str
    author_name: str
    author_role: str
    author_initials: str
    author_verified: bool
    region: str
    likes: List[str] = field(default_factory=list)  # Lista de IDs de usuários que curtiram
    comments_count: int = 0
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    # Específicos para diagnóstico
    pathogen: Optional[str] = None
    severity: Optional[str] = None  # 'Baixa', 'Moderada', 'Alta'

    # Específicos para vaga/oportunidade
    salary: Optional[str] = None
    duration: Optional[str] = None

    def is_liked_by(self, user_id: str) -> bool:
        return user_id in self.likes
