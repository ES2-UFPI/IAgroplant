import pytest
from unittest.mock import MagicMock
from domains.reputation.domain.entities.reputation_entry import ReputationEntry
from domains.reputation.domain.entities.reputation_action import POST_VERIFIED, DIAGNOSIS_CONFIRMED
from domains.reputation.application.use_cases.award_reputation_use_case import (
    AwardReputationUseCase,
    AwardReputationInput,
)
from domains.reputation.application.use_cases.get_reputation_summary_use_case import (
    GetReputationSummaryUseCase,
)


@pytest.fixture
def mock_repo():
    return MagicMock()


class TestAwardReputationUseCase:

    def test_awards_correct_points_for_action(self, mock_repo):
        mock_repo.has_entry_reference.return_value = False
        mock_repo.add_entry.side_effect = lambda e: e

        use_case = AwardReputationUseCase(repository=mock_repo)
        entry = use_case.execute(AwardReputationInput(user_id="user-1", action_type=POST_VERIFIED))

        assert entry.points == 10
        assert entry.user_id == "user-1"
        mock_repo.add_entry.assert_called_once()

    def test_rejects_unknown_action(self, mock_repo):
        use_case = AwardReputationUseCase(repository=mock_repo)

        with pytest.raises(ValueError, match="Ação de reputação desconhecida"):
            use_case.execute(AwardReputationInput(user_id="user-1", action_type="acao_inexistente"))

    def test_rejects_duplicate_reference_id(self, mock_repo):
        mock_repo.has_entry_reference.return_value = True

        use_case = AwardReputationUseCase(repository=mock_repo)

        with pytest.raises(ValueError, match="já concedeu pontos"):
            use_case.execute(
                AwardReputationInput(
                    user_id="user-1",
                    action_type=DIAGNOSIS_CONFIRMED,
                    reference_id="diagnostic:abc",
                )
            )
        mock_repo.add_entry.assert_not_called()

    def test_negative_points_for_post_removed(self, mock_repo):
        mock_repo.has_entry_reference.return_value = False
        mock_repo.add_entry.side_effect = lambda e: e

        use_case = AwardReputationUseCase(repository=mock_repo)
        entry = use_case.execute(
            AwardReputationInput(user_id="user-1", action_type="post_removed_violation")
        )

        assert entry.points == -20


class TestGetReputationSummaryUseCase:

    def test_sums_ledger_entries(self, mock_repo):
        entries = [
            ReputationEntry(id="1", user_id="user-1", action_type=POST_VERIFIED, points=10),
            ReputationEntry(id="2", user_id="user-1", action_type=DIAGNOSIS_CONFIRMED, points=15),
            ReputationEntry(id="3", user_id="user-1", action_type="post_removed_violation", points=-20),
        ]
        mock_repo.get_entries_by_user.return_value = entries

        use_case = GetReputationSummaryUseCase(repository=mock_repo)
        summary = use_case.execute("user-1")

        assert summary.total == 5
        assert len(summary.entries) == 3

    def test_empty_ledger_totals_zero(self, mock_repo):
        mock_repo.get_entries_by_user.return_value = []

        use_case = GetReputationSummaryUseCase(repository=mock_repo)
        summary = use_case.execute("user-sem-historico")

        assert summary.total == 0
        assert summary.entries == []
