import pytest
from unittest.mock import MagicMock
from domains.auth.domain.entities.user import User
from domains.users.application.use_cases.search_specialists_use_case import (
    SearchSpecialistsUseCase,
    SearchSpecialistsInput,
)


@pytest.fixture
def mock_user_repo():
    return MagicMock()


@pytest.fixture
def mock_reputation_repo():
    return MagicMock()


@pytest.fixture
def especialista_macaxeira():
    return User(
        id="prof-1",
        email="prof1@teste.com",
        name="Endrick Agrônomo",
        role="Agrônomo",
        region="Piauí",
        certificado=True,
        especialidades=["Plantio de Macaxeira", "Solo"],
    )


@pytest.fixture
def especialista_pragas():
    return User(
        id="prof-2",
        email="prof2@teste.com",
        name="Emerson Especialista",
        role="Agrônomo",
        region="Ceará",
        certificado=True,
        especialidades=["Manejo de Pragas"],
    )


class TestSearchSpecialistsUseCase:

    def test_finds_specialist_by_topic_case_insensitive(
        self, mock_user_repo, mock_reputation_repo, especialista_macaxeira
    ):
        mock_user_repo.search_specialists.return_value = [especialista_macaxeira]
        mock_reputation_repo.get_entries_by_user.return_value = []

        use_case = SearchSpecialistsUseCase(
            user_repository=mock_user_repo, reputation_repository=mock_reputation_repo
        )
        result = use_case.execute(SearchSpecialistsInput(topic="macaxeira"))

        assert len(result) == 1
        assert result[0].id == "prof-1"
        mock_user_repo.search_specialists.assert_called_once_with(
            topic="macaxeira", region=None
        )

    def test_filters_by_region_when_provided(self, mock_user_repo, mock_reputation_repo):
        mock_user_repo.search_specialists.return_value = []
        use_case = SearchSpecialistsUseCase(
            user_repository=mock_user_repo, reputation_repository=mock_reputation_repo
        )

        use_case.execute(SearchSpecialistsInput(topic="macaxeira", region="Piauí"))

        mock_user_repo.search_specialists.assert_called_once_with(
            topic="macaxeira", region="Piauí"
        )

    def test_raises_when_topic_is_empty(self, mock_user_repo, mock_reputation_repo):
        use_case = SearchSpecialistsUseCase(
            user_repository=mock_user_repo, reputation_repository=mock_reputation_repo
        )

        with pytest.raises(ValueError, match="tema"):
            use_case.execute(SearchSpecialistsInput(topic="   "))

        mock_user_repo.search_specialists.assert_not_called()

    def test_orders_results_by_reputation_desc(
        self, mock_user_repo, mock_reputation_repo, especialista_macaxeira, especialista_pragas
    ):
        # prof-2 tem menos pontos de reputação que prof-1
        mock_user_repo.search_specialists.return_value = [
            especialista_pragas,
            especialista_macaxeira,
        ]

        def entries_by_user(user_id):
            from domains.reputation.domain.entities.reputation_entry import ReputationEntry
            from datetime import datetime, timezone

            points = {"prof-1": 10, "prof-2": 2}[user_id]
            return [
                ReputationEntry(
                    id="e1",
                    user_id=user_id,
                    action_type="diagnostico_aceito",
                    points=points,
                    reference_id="ref-1",
                    created_at=datetime.now(timezone.utc),
                )
            ]

        mock_reputation_repo.get_entries_by_user.side_effect = entries_by_user

        use_case = SearchSpecialistsUseCase(
            user_repository=mock_user_repo, reputation_repository=mock_reputation_repo
        )
        result = use_case.execute(SearchSpecialistsInput(topic="a"))

        assert [r.id for r in result] == ["prof-1", "prof-2"]
        assert result[0].reputacao == 10
        assert result[1].reputacao == 2

    def test_works_without_reputation_repository(self, mock_user_repo, especialista_macaxeira):
        mock_user_repo.search_specialists.return_value = [especialista_macaxeira]

        use_case = SearchSpecialistsUseCase(user_repository=mock_user_repo, reputation_repository=None)
        result = use_case.execute(SearchSpecialistsInput(topic="macaxeira"))

        assert len(result) == 1
        assert result[0].reputacao == 0