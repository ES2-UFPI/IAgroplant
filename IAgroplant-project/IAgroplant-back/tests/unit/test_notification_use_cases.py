import pytest
from unittest.mock import MagicMock
from domains.notifications.domain.entities.notification import Notification, NotificationType
from domains.notifications.application.use_cases.get_user_notifications_use_case import (
    GetUserNotificationsUseCase,
    GetUserNotificationsInput,
)
from domains.notifications.application.use_cases.mark_notification_read_use_case import (
    MarkNotificationReadUseCase,
    MarkNotificationReadInput,
)
from domains.notifications.application.use_cases.notify_feed_post_use_case import (
    NotifyFeedPostUseCase,
    NotifyFeedPostInput,
)


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_notification():
    return Notification(
        id="notif-123",
        user_id="user-123",
        title="Nova postagem na sua tag seguida",
        body="Um novo post sobre 'milho' foi publicado: Como plantar milho",
        type=NotificationType.FEED_POST,
        metadata={"post_id": "post-456", "tag": "milho"},
    )


@pytest.fixture
def mock_repo(mock_notification):
    repo = MagicMock()
    repo.create.return_value = mock_notification
    repo.find_by_user_id.return_value = [mock_notification]
    repo.mark_as_read.return_value = True
    return repo


# ─── GetUserNotificationsUseCase ──────────────────────────────────────────────

class TestGetUserNotificationsUseCase:

    def test_retorna_notificacoes_do_usuario(self, mock_repo):
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        assert len(result.notifications) == 1
        assert result.notifications[0].type == NotificationType.FEED_POST

    def test_retorna_lista_vazia_quando_sem_notificacoes(self, mock_repo):
        mock_repo.find_by_user_id.return_value = []
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-999"))

        assert result.notifications == []


# ─── MarkNotificationReadUseCase ──────────────────────────────────────────────

class TestMarkNotificationReadUseCase:

    def test_marca_notificacao_como_lida(self, mock_repo):
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        result = use_case.execute(MarkNotificationReadInput(notification_id="notif-123"))

        assert result.success is True

    def test_retorna_false_quando_falha(self, mock_repo):
        mock_repo.mark_as_read.return_value = False
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        result = use_case.execute(MarkNotificationReadInput(notification_id="notif-999"))

        assert result.success is False


# ─── NotifyFeedPostUseCase ────────────────────────────────────────────────────

class TestNotifyFeedPostUseCase:

    def test_cria_notificacao_de_feed(self, mock_repo):
        use_case = NotifyFeedPostUseCase(notification_repository=mock_repo)
        result = use_case.execute(NotifyFeedPostInput(
            user_id="user-123",
            post_id="post-456",
            post_title="Como plantar milho",
            tag="milho",
        ))

        assert result.notification_id == "notif-123"
        assert result.user_id == "user-123"