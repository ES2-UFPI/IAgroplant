from dataclasses import dataclass, field
from typing import List, Optional

from domains.auth.domain.entities.user import User
from domains.users.domain.repositories.user_repository import UserRepository


@dataclass
class SearchSpecialistsInput:
    topic: str
    region: Optional[str] = None


@dataclass
class SpecialistResult:
    id: str
    name: str
    region: Optional[str]
    especialidades: List[str]
    certificado: bool
    photo_url: Optional[str]
    reputacao: int = 0


class SearchSpecialistsUseCase:
    """
    Caso de uso: buscar profissionais certificados que dominam um tema
    específico (ex.: "macaxeira"), para que o usuário possa iniciar uma
    conversa no chat com o especialista mais relevante.

    Histórico de usuário (Product Backlog #8): "Como agrônomo, quero saber
    mais sobre plantio de macaxeira com especialistas" — módulo Chat/Feed.
    """

    def __init__(self, user_repository: UserRepository, reputation_repository=None):
        self._user_repo = user_repository
        self._reputation_repo = reputation_repository

    def execute(self, input_data: SearchSpecialistsInput) -> List[SpecialistResult]:
        topic = (input_data.topic or "").strip()
        if not topic:
            raise ValueError("O tema de busca é obrigatório.")

        specialists = self._user_repo.search_specialists(
            topic=topic, region=input_data.region
        )

        results = [self._to_result(user) for user in specialists]
        results.sort(key=lambda r: r.reputacao, reverse=True)
        return results

    def _to_result(self, user: User) -> SpecialistResult:
        reputacao = 0
        if self._reputation_repo is not None:
            entries = self._reputation_repo.get_entries_by_user(user.id)
            reputacao = sum(e.points for e in entries)

        return SpecialistResult(
            id=user.id,
            name=user.name,
            region=user.region,
            especialidades=user.especialidades,
            certificado=user.certificado,
            photo_url=user.photo_url,
            reputacao=reputacao,
        )