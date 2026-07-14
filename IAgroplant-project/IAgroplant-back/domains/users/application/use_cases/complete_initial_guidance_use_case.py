from dataclasses import dataclass

from domains.users.domain.repositories.user_repository import UserRepository


@dataclass(frozen=True)
class InitialGuidanceCompletion:
    user_id: str
    role: str
    completed: bool


class CompleteInitialGuidanceUseCase:

    def __init__(self, repository: UserRepository):
        self.repository = repository

    def execute(self, user_id: str) -> InitialGuidanceCompletion:
        user = self.repository.mark_initial_guidance_completed(user_id)
        if not user:
            raise ValueError("Usuário não encontrado.")

        return InitialGuidanceCompletion(
            user_id=user.id,
            role=user.role,
            completed=user.initial_guidance_completed,
        )
