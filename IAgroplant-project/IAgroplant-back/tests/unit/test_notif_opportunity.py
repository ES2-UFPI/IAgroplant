import pytest
from unittest.mock import MagicMock
from domains.notifications.domain.entities.notification import Notification, NotificationType
from domains.notifications.application.use_cases.notify_new_opportunity_use_case import (
    NotifyNewOpportunityUseCase,
    NotifyNewOpportunityInput,
)
from domains.notifications.application.use_cases.get_user_notifications_use_case import (
    GetUserNotificationsUseCase,
    GetUserNotificationsInput,
)
from domains.notifications.application.use_cases.mark_notification_read_use_case import (
    MarkNotificationReadUseCase,
    MarkNotificationReadInput,
)


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_opportunity_notification():
    return Notification(
        id="notif-789",
        user_id="user-123",
        title="Nova oportunidade disponível!",
        body="'Estágio em Agronomia' em Teresina - PI",
        type=NotificationType.OPPORTUNITY,
        metadata={
            "opportunity_id": "opp-001",
            "location": "Teresina - PI",
        },
    )


@pytest.fixture
def mock_repo(mock_opportunity_notification):
    repo = MagicMock()
    repo.create.return_value = mock_opportunity_notification
    repo.find_by_user_id.return_value = [mock_opportunity_notification]
    repo.mark_as_read.return_value = True
    return repo


# ─── NotifyNewOpportunityUseCase ──────────────────────────────────────────────

class TestNotifyNewOpportunityUseCase:

    def test_cria_notificacao_de_oportunidade(self, mock_repo):
        use_case = NotifyNewOpportunityUseCase(notification_repository=mock_repo)
        result = use_case.execute(NotifyNewOpportunityInput(
            user_id="user-123",
            opportunity_id="opp-001",
            opportunity_title="Estágio em Agronomia",
            location="Teresina - PI",
        ))

        assert result.notification_id == "notif-789"
        assert result.user_id == "user-123"
        assert "oportunidade" in result.title.lower()

    def test_tipo_da_notificacao_e_opportunity(self, mock_repo):
        use_case = NotifyNewOpportunityUseCase(notification_repository=mock_repo)
        use_case.execute(NotifyNewOpportunityInput(
            user_id="user-123",
            opportunity_id="opp-001",
            opportunity_title="Estágio em Agronomia",
            location="Teresina - PI",
        ))

        call_args = mock_repo.create.call_args[0][0]
        assert call_args.type == NotificationType.OPPORTUNITY


# ─── GetUserNotificationsUseCase ──────────────────────────────────────────────

class TestGetUserNotificationsUseCase:

    def test_retorna_notificacoes_do_usuario(self, mock_repo):
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        assert len(result.notifications) == 1
        assert result.notifications[0].type == NotificationType.OPPORTUNITY

    def test_retorna_lista_vazia(self, mock_repo):
        mock_repo.find_by_user_id.return_value = []
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-999"))

        assert result.notifications == []


# ─── MarkNotificationReadUseCase ──────────────────────────────────────────────

class TestMarkNotificationReadUseCase:

    def test_marca_notificacao_como_lida(self, mock_repo):
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        result = use_case.execute(MarkNotificationReadInput(notification_id="notif-789"))

        assert result.success is True

    def test_retorna_false_quando_falha(self, mock_repo):
        mock_repo.mark_as_read.return_value = False
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        result = use_case.execute(MarkNotificationReadInput(notification_id="notif-999"))

        assert result.success is False