import pytest
from unittest.mock import MagicMock

from domains.auth.domain.entities.user import User
from domains.users.application.use_cases.complete_initial_guidance_use_case import (
    CompleteInitialGuidanceUseCase,
)
from domains.users.application.use_cases.get_initial_guidance_status_use_case import (
    GetInitialGuidanceStatusUseCase,
)


def make_user(role="Estudante", completed=False):
    return User(
        id="user-1",
        email="user@teste.com",
        name="Usuário Teste",
        role=role,
        initial_guidance_completed=completed,
    )


class TestGetInitialGuidanceStatusUseCase:

    def test_returns_pending_status_for_user_that_never_completed(self):
        repo = MagicMock()
        repo.get_initial_guidance_status.return_value = make_user(completed=False)

        result = GetInitialGuidanceStatusUseCase(repo).execute("user-1")

        assert result.user_id == "user-1"
        assert result.completed is False
        assert result.role == "Estudante"
        repo.get_initial_guidance_status.assert_called_once_with("user-1")

    def test_returns_completed_status_for_user_that_already_completed(self):
        repo = MagicMock()
        repo.get_initial_guidance_status.return_value = make_user(completed=True)

        result = GetInitialGuidanceStatusUseCase(repo).execute("user-1")

        assert result.completed is True

    @pytest.mark.parametrize("role", ["Estudante", "Produtor", "Agrônomo/Técnico"])
    def test_returns_user_profile_for_personalized_guidance(self, role):
        repo = MagicMock()
        repo.get_initial_guidance_status.return_value = make_user(role=role)

        result = GetInitialGuidanceStatusUseCase(repo).execute("user-1")

        assert result.role == role

    def test_raises_when_user_does_not_exist(self):
        repo = MagicMock()
        repo.get_initial_guidance_status.return_value = None

        with pytest.raises(ValueError, match="Usuário não encontrado."):
            GetInitialGuidanceStatusUseCase(repo).execute("missing")


class TestCompleteInitialGuidanceUseCase:

    def test_updates_initial_guidance_status(self):
        repo = MagicMock()
        repo.mark_initial_guidance_completed.return_value = make_user(completed=True)

        result = CompleteInitialGuidanceUseCase(repo).execute("user-1")

        assert result.completed is True
        repo.mark_initial_guidance_completed.assert_called_once_with("user-1")

    def test_raises_when_updating_missing_user(self):
        repo = MagicMock()
        repo.mark_initial_guidance_completed.return_value = None

        with pytest.raises(ValueError, match="Usuário não encontrado."):
            CompleteInitialGuidanceUseCase(repo).execute("missing")
