import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional
from domains.posts.domain.entities.post import Post
from domains.posts.domain.repositories.post_repository import PostRepository


@dataclass
class CreatePostInput:
    type: str  # 'simple', 'diagnostic', 'opportunity'
    content: str
    image_url: Optional[str]
    tags: List[str]
    author_id: str
    author_name: str
    author_role: str
    author_verified: bool
    region: str
    # Específicos para diagnóstico
    pathogen: Optional[str] = None
    severity: Optional[str] = None
    # Específicos para vaga
    salary: Optional[str] = None
    duration: Optional[str] = None


class CreatePostUseCase:

    def __init__(self, repository: PostRepository):
        self._repo = repository

    def execute(self, input_data: CreatePostInput) -> Post:
        if not input_data.content:
            raise ValueError("O conteúdo do post não pode ser vazio.")

        if input_data.type not in ["simple", "diagnostic", "opportunity"]:
            raise ValueError(f"Tipo de post inválido: {input_data.type}")

        # Business Rule check: Certificação e badge
        # Apenas agrônomos ou técnicos recebem badge de verificado por padrão no feed
        author_verified = input_data.author_verified
        role_normalized = input_data.author_role.lower()
        if "agrônomo" in role_normalized or "técnico" in role_normalized or "fitopatologista" in role_normalized:
            author_verified = True

        # Iniciais do autor
        initials = "".join([n[0] for n in input_data.author_name.split() if n])[:2].upper()
        if not initials:
            initials = "US"

        post = Post(
            id=str(uuid.uuid4()),
            type=input_data.type,
            content=input_data.content,
            image_url=input_data.image_url,
            tags=input_data.tags,
            author_id=input_data.author_id,
            author_name=input_data.author_name,
            author_role=input_data.author_role,
            author_initials=initials,
            author_verified=author_verified,
            region=input_data.region,
            likes=[],
            comments_count=0,
            created_at=datetime.now(timezone.utc),
            pathogen=input_data.pathogen,
            severity=input_data.severity,
            salary=input_data.salary,
            duration=input_data.duration,
        )

        return self._repo.save(post)
