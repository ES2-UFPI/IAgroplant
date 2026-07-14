from dataclasses import dataclass

from domains.users.domain.repositories.user_repository import UserRepository


@dataclass(frozen=True)
class InteractiveOnboardingCompletion:
    user_id: str
    completed: bool


class CompleteInteractiveOnboardingUseCase:

    def __init__(self, repository: UserRepository):
        self.repository = repository

    def execute(self, user_id: str) -> InteractiveOnboardingCompletion:
        user = self.repository.mark_interactive_onboarding_completed(user_id)
        if not user:
            raise ValueError("Usuário não encontrado.")

        return InteractiveOnboardingCompletion(
            user_id=user.id,
            completed=user.interactive_onboarding_completed,
        )
