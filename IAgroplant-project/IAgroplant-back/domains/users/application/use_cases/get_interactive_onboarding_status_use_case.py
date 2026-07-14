from dataclasses import dataclass

from domains.users.domain.repositories.user_repository import UserRepository


@dataclass(frozen=True)
class InteractiveOnboardingStatus:
    user_id: str
    completed: bool


class GetInteractiveOnboardingStatusUseCase:

    def __init__(self, repository: UserRepository):
        self.repository = repository

    def execute(self, user_id: str) -> InteractiveOnboardingStatus:
        user = self.repository.get_interactive_onboarding_status(user_id)
        if not user:
            raise ValueError("Usuário não encontrado.")

        return InteractiveOnboardingStatus(
            user_id=user.id,
            completed=user.interactive_onboarding_completed,
        )
