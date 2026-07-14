from dataclasses import dataclass

from domains.users.domain.repositories.user_repository import UserRepository


@dataclass(frozen=True)
class InitialGuidanceStatus:
    user_id: str
    role: str
    completed: bool


class GetInitialGuidanceStatusUseCase:

    def __init__(self, repository: UserRepository):
        self.repository = repository

    def execute(self, user_id: str) -> InitialGuidanceStatus:
        user = self.repository.get_initial_guidance_status(user_id)
        if not user:
            raise ValueError("Usuário não encontrado.")

        return InitialGuidanceStatus(
            user_id=user.id,
            role=user.role,
            completed=user.initial_guidance_completed,
        )
