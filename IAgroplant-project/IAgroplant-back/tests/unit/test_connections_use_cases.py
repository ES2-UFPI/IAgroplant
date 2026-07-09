import pytest
from unittest.mock import MagicMock
from domains.auth.domain.entities.user import User
from domains.connections.domain.entities.connection_request import ConnectionRequest
from domains.connections.application.use_cases.send_connection_request_use_case import (
    SendConnectionRequestUseCase,
    SendConnectionRequestInput,
)
from domains.connections.application.use_cases.accept_connection_request_use_case import (
    AcceptConnectionRequestUseCase,
    AcceptConnectionRequestInput,
)


@pytest.fixture
def mock_connection_repo():
    return MagicMock()


@pytest.fixture
def mock_user_repo():
    return MagicMock()


@pytest.fixture
def mock_reputation_repo():
    repo = MagicMock()
    repo.has_entry_reference.return_value = False
    repo.add_entry.side_effect = lambda e: e
    return repo


@pytest.fixture
def requester():
    return User(id="user-1", email="user1@teste.com", name="Solicitante", role="Estudante", certificado=False)


@pytest.fixture
def certified_professional():
    return User(id="prof-1", email="prof@teste.com", name="Profissional", role="Agrônomo", certificado=True)


@pytest.fixture
def uncertified_recipient():
    return User(id="user-2", email="user2@teste.com", name="Não Certificado", role="Estudante", certificado=False)


class TestSendConnectionRequestUseCase:

    def test_sends_request_successfully(self, mock_connection_repo, mock_user_repo, requester, certified_professional):
        mock_user_repo.get_by_id.return_value = certified_professional
        mock_connection_repo.has_pending_request.return_value = False
        mock_connection_repo.save.side_effect = lambda c: c

        use_case = SendConnectionRequestUseCase(
            connection_repository=mock_connection_repo, user_repository=mock_user_repo
        )
        result = use_case.execute(
            SendConnectionRequestInput(from_user=requester, to_user_id="prof-1")
        )

        assert result.from_user_id == "user-1"
        assert result.to_user_id == "prof-1"
        assert result.status == "pending"

    def test_blocks_self_request(self, mock_connection_repo, mock_user_repo, requester):
        use_case = SendConnectionRequestUseCase(
            connection_repository=mock_connection_repo, user_repository=mock_user_repo
        )

        with pytest.raises(ValueError, match="para si mesmo"):
            use_case.execute(SendConnectionRequestInput(from_user=requester, to_user_id="user-1"))

    def test_blocks_duplicate_pending_request(self, mock_connection_repo, mock_user_repo, requester, certified_professional):
        mock_user_repo.get_by_id.return_value = certified_professional
        mock_connection_repo.has_pending_request.return_value = True

        use_case = SendConnectionRequestUseCase(
            connection_repository=mock_connection_repo, user_repository=mock_user_repo
        )

        with pytest.raises(ValueError, match="solicitação de conexão pendente"):
            use_case.execute(SendConnectionRequestInput(from_user=requester, to_user_id="prof-1"))


class TestAcceptConnectionRequestUseCase:

    def test_accepts_and_awards_requester(self, mock_connection_repo, mock_reputation_repo, certified_professional):
        connection = ConnectionRequest(
            id="conn-1", from_user_id="user-1", from_user_name="Solicitante",
            to_user_id="prof-1", to_user_name="Profissional",
        )
        mock_connection_repo.get_by_id.return_value = connection
        mock_connection_repo.save.side_effect = lambda c: c

        use_case = AcceptConnectionRequestUseCase(
            connection_repository=mock_connection_repo, reputation_repository=mock_reputation_repo
        )
        result = use_case.execute(
            AcceptConnectionRequestInput(connection_id="conn-1", acting_user=certified_professional)
        )

        assert result.status == "accepted"
        awarded_entry = mock_reputation_repo.add_entry.call_args[0][0]
        assert awarded_entry.user_id == "user-1"
        assert awarded_entry.points == 3

    def test_blocks_uncertified_acceptor(self, mock_connection_repo, mock_reputation_repo, uncertified_recipient):
        connection = ConnectionRequest(
            id="conn-1", from_user_id="user-1", from_user_name="Solicitante",
            to_user_id="user-2", to_user_name="Não Certificado",
        )
        mock_connection_repo.get_by_id.return_value = connection

        use_case = AcceptConnectionRequestUseCase(
            connection_repository=mock_connection_repo, reputation_repository=mock_reputation_repo
        )

        with pytest.raises(PermissionError, match="certificados"):
            use_case.execute(
                AcceptConnectionRequestInput(connection_id="conn-1", acting_user=uncertified_recipient)
            )

    def test_blocks_wrong_recipient(self, mock_connection_repo, mock_reputation_repo, certified_professional):
        connection = ConnectionRequest(
            id="conn-1", from_user_id="user-1", from_user_name="Solicitante",
            to_user_id="outro-usuario", to_user_name="Outro",
        )
        mock_connection_repo.get_by_id.return_value = connection

        use_case = AcceptConnectionRequestUseCase(
            connection_repository=mock_connection_repo, reputation_repository=mock_reputation_repo
        )

        with pytest.raises(PermissionError, match="destinatário"):
            use_case.execute(
                AcceptConnectionRequestInput(connection_id="conn-1", acting_user=certified_professional)
            )

    def test_blocks_re_accept(self, mock_connection_repo, mock_reputation_repo, certified_professional):
        connection = ConnectionRequest(
            id="conn-1", from_user_id="user-1", from_user_name="Solicitante",
            to_user_id="prof-1", to_user_name="Profissional", status="accepted",
        )
        mock_connection_repo.get_by_id.return_value = connection

        use_case = AcceptConnectionRequestUseCase(
            connection_repository=mock_connection_repo, reputation_repository=mock_reputation_repo
        )

        with pytest.raises(ValueError, match="já foi respondida"):
            use_case.execute(
                AcceptConnectionRequestInput(connection_id="conn-1", acting_user=certified_professional)
            )
