from dataclasses import dataclass, replace
from typing import List, Optional
from domains.auth.domain.entities.user import User
from domains.users.domain.repositories.user_repository import UserRepository


@dataclass
class UpdateProfileInput:
    name: Optional[str] = None
    region: Optional[str] = None
    especialidades: Optional[List[str]] = None


class UpdateProfileUseCase:
    """
    Atualiza apenas name/region/especialidades. Propositalmente não aceita
    email/certificado/photo_url: email pertence ao domínio auth, certificado
    é definido manualmente pela equipe e photo_url é gerido pelo fluxo de
    upload dedicado (UpdateProfilePhotoUseCase).
    """

    def __init__(self, repository: UserRepository):
        self._repo = repository

    def execute(self, current_user: User, input_data: UpdateProfileInput) -> User:
        existing = self._repo.get_by_id(current_user.id) or current_user

        changes = {}
        if input_data.name is not None:
            changes["name"] = input_data.name
        if input_data.region is not None:
            changes["region"] = input_data.region
        if input_data.especialidades is not None:
            changes["especialidades"] = input_data.especialidades

        updated = replace(existing, **changes)
        return self._repo.update(updated)
