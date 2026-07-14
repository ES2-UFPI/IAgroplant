import pytest
from unittest.mock import MagicMock

from domains.auth.domain.entities.user import User
from domains.users.application.use_cases.complete_interactive_onboarding_use_case import (
    CompleteInteractiveOnboardingUseCase,
)
from domains.users.application.use_cases.get_interactive_onboarding_status_use_case import (
    GetInteractiveOnboardingStatusUseCase,
)


def make_user(completed=False):
    return User(
        id="user-1",
        email="user@teste.com",
        name="Usuário Teste",
        role="Produtor Rural",
        initial_guidance_completed=True,
        interactive_onboarding_completed=completed,
    )


class TestGetInteractiveOnboardingStatusUseCase:

    def test_returns_pending_status_for_user_that_never_completed_coach_marks(self):
        repo = MagicMock()
        repo.get_interactive_onboarding_status.return_value = make_user(completed=False)

        result = GetInteractiveOnboardingStatusUseCase(repo).execute("user-1")

        assert result.user_id == "user-1"
        assert result.completed is False
        repo.get_interactive_onboarding_status.assert_called_once_with("user-1")

    def test_returns_completed_status_for_user_that_already_completed_coach_marks(self):
        repo = MagicMock()
        repo.get_interactive_onboarding_status.return_value = make_user(completed=True)

        result = GetInteractiveOnboardingStatusUseCase(repo).execute("user-1")

        assert result.completed is True

    def test_raises_when_user_does_not_exist(self):
        repo = MagicMock()
        repo.get_interactive_onboarding_status.return_value = None

        with pytest.raises(ValueError, match="Usuário não encontrado."):
            GetInteractiveOnboardingStatusUseCase(repo).execute("missing")


class TestCompleteInteractiveOnboardingUseCase:

    def test_updates_interactive_onboarding_status(self):
        repo = MagicMock()
        repo.mark_interactive_onboarding_completed.return_value = make_user(completed=True)

        result = CompleteInteractiveOnboardingUseCase(repo).execute("user-1")

        assert result.completed is True
        repo.mark_interactive_onboarding_completed.assert_called_once_with("user-1")

    def test_raises_when_updating_missing_user(self):
        repo = MagicMock()
        repo.mark_interactive_onboarding_completed.return_value = None

        with pytest.raises(ValueError, match="Usuário não encontrado."):
            CompleteInteractiveOnboardingUseCase(repo).execute("missing")
