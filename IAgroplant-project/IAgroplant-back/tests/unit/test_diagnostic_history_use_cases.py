import pytest
from unittest.mock import MagicMock
from domains.auth.domain.entities.user import User
from domains.ai.domain.entities.diagnostic_record import DiagnosticRecord
from domains.ai.application.use_cases.save_diagnostic_record_use_case import (
    SaveDiagnosticRecordUseCase,
    SaveDiagnosticRecordInput,
)
from domains.ai.application.use_cases.confirm_diagnostic_use_case import (
    ConfirmDiagnosticUseCase,
    ConfirmDiagnosticInput,
)
from domains.ai.application.use_cases.list_pending_diagnostics_use_case import (
    ListPendingDiagnosticsUseCase,
)


@pytest.fixture
def mock_record_repo():
    return MagicMock()


@pytest.fixture
def mock_reputation_repo():
    repo = MagicMock()
    repo.has_entry_reference.return_value = False
    repo.add_entry.side_effect = lambda e: e
    return repo


@pytest.fixture
def submitter_record():
    return DiagnosticRecord(
        id="diag-1",
        user_id="user-1",
        pathogen="Ferrugem Asiática",
        severity="Moderada",
        management="Aplicar fungicida triazol.",
        technical_warning="Consulte um agrônomo antes de aplicar defensivos.",
    )


@pytest.fixture
def certified_agronomist():
    return User(id="agro-1", email="agro@teste.com", name="Agrônomo", role="Agrônomo", certificado=True)


@pytest.fixture
def uncertified_user():
    return User(id="user-2", email="user2@teste.com", name="Usuário Comum", role="Estudante", certificado=False)


class TestSaveDiagnosticRecordUseCase:

    def test_saves_record_with_user_id(self, mock_record_repo):
        mock_record_repo.save.side_effect = lambda r: r

        use_case = SaveDiagnosticRecordUseCase(repository=mock_record_repo)
        record = use_case.execute(
            SaveDiagnosticRecordInput(
                user_id="user-1",
                pathogen="Oídio",
                severity="Baixa",
                management="Monitorar.",
                technical_warning="Aviso técnico.",
            )
        )

        assert record.user_id == "user-1"
        assert record.confirmed is False


class TestListPendingDiagnosticsUseCase:

    def test_excludes_own_diagnostics(self, mock_record_repo, submitter_record):
        other_record = DiagnosticRecord(
            id="diag-2", user_id="agro-1", pathogen="X", severity="Alta",
            management="Y", technical_warning="Z",
        )
        mock_record_repo.list_pending_confirmation.return_value = [submitter_record, other_record]

        use_case = ListPendingDiagnosticsUseCase(repository=mock_record_repo)
        results = use_case.execute(exclude_user_id="agro-1")

        assert len(results) == 1
        assert results[0].id == "diag-1"


class TestConfirmDiagnosticUseCase:

    def test_confirms_and_awards_submitter_not_confirmer(self, mock_record_repo, mock_reputation_repo, certified_agronomist, submitter_record):
        mock_record_repo.get_by_id.return_value = submitter_record
        mock_record_repo.save.side_effect = lambda r: r

        use_case = ConfirmDiagnosticUseCase(
            record_repository=mock_record_repo, reputation_repository=mock_reputation_repo
        )
        result = use_case.execute(
            ConfirmDiagnosticInput(record_id="diag-1", confirming_user=certified_agronomist)
        )

        assert result.confirmed is True
        assert result.confirmed_by == "agro-1"
        awarded_entry = mock_reputation_repo.add_entry.call_args[0][0]
        assert awarded_entry.user_id == "user-1"  # premia quem submeteu, não quem confirma
        assert awarded_entry.points == 15

    def test_blocks_uncertified_confirmer(self, mock_record_repo, mock_reputation_repo, uncertified_user, submitter_record):
        mock_record_repo.get_by_id.return_value = submitter_record

        use_case = ConfirmDiagnosticUseCase(
            record_repository=mock_record_repo, reputation_repository=mock_reputation_repo
        )

        with pytest.raises(PermissionError):
            use_case.execute(
                ConfirmDiagnosticInput(record_id="diag-1", confirming_user=uncertified_user)
            )

    def test_blocks_self_confirmation(self, mock_record_repo, mock_reputation_repo, submitter_record):
        mock_record_repo.get_by_id.return_value = submitter_record
        self_confirming_user = User(
            id="user-1", email="user1@teste.com", name="Autor", role="Agrônomo", certificado=True
        )

        use_case = ConfirmDiagnosticUseCase(
            record_repository=mock_record_repo, reputation_repository=mock_reputation_repo
        )

        with pytest.raises(ValueError, match="próprio diagnóstico"):
            use_case.execute(
                ConfirmDiagnosticInput(record_id="diag-1", confirming_user=self_confirming_user)
            )

    def test_blocks_double_confirmation(self, mock_record_repo, mock_reputation_repo, certified_agronomist, submitter_record):
        submitter_record.confirmed = True
        mock_record_repo.get_by_id.return_value = submitter_record

        use_case = ConfirmDiagnosticUseCase(
            record_repository=mock_record_repo, reputation_repository=mock_reputation_repo
        )

        with pytest.raises(ValueError, match="já foi confirmado"):
            use_case.execute(
                ConfirmDiagnosticInput(record_id="diag-1", confirming_user=certified_agronomist)
            )
