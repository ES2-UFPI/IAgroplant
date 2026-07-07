import pytest
from unittest.mock import MagicMock
from domains.notifications.domain.entities.notification import Notification, NotificationType
from domains.notifications.application.use_cases.notify_chat_message_use_case import (
    NotifyChatMessageUseCase,
    NotifyChatMessageInput,
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
def mock_chat_notification():
    return Notification(
        id="notif-456",
        user_id="user-123",
        title="Nova mensagem de João",
        body="Oi, tudo bem?",
        type=NotificationType.CHAT_MESSAGE,
        metadata={"chat_id": "chat-789", "sender_name": "João"},
    )


@pytest.fixture
def mock_repo(mock_chat_notification):
    repo = MagicMock()
    repo.create.return_value = mock_chat_notification
    repo.find_by_user_id.return_value = [mock_chat_notification]
    repo.mark_as_read.return_value = True
    return repo


# ─── NotifyChatMessageUseCase ─────────────────────────────────────────────────

class TestNotifyChatMessageUseCase:

    def test_cria_notificacao_de_chat(self, mock_repo):
        use_case = NotifyChatMessageUseCase(notification_repository=mock_repo)
        result = use_case.execute(NotifyChatMessageInput(
            user_id="user-123",
            sender_name="João",
            message_preview="Oi, tudo bem?",
            chat_id="chat-789",
        ))

        assert result.notification_id == "notif-456"
        assert result.user_id == "user-123"
        assert "João" in result.title

    def test_tipo_da_notificacao_e_chat_message(self, mock_repo):
        mock_repo.create.return_value.type = NotificationType.CHAT_MESSAGE
        use_case = NotifyChatMessageUseCase(notification_repository=mock_repo)
        use_case.execute(NotifyChatMessageInput(
            user_id="user-123",
            sender_name="João",
            message_preview="Oi, tudo bem?",
            chat_id="chat-789",
        ))

        call_args = mock_repo.create.call_args[0][0]
        assert call_args.type == NotificationType.CHAT_MESSAGE


# ─── GetUserNotificationsUseCase ──────────────────────────────────────────────

class TestGetUserNotificationsUseCase:

    def test_retorna_notificacoes_do_usuario(self, mock_repo):
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        assert len(result.notifications) == 1
        assert result.notifications[0].type == NotificationType.CHAT_MESSAGE

    def test_retorna_lista_vazia_quando_sem_notificacoes(self, mock_repo):
        mock_repo.find_by_user_id.return_value = []
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-999"))

        assert result.notifications == []


# ─── MarkNotificationReadUseCase ──────────────────────────────────────────────

class TestMarkNotificationReadUseCase:

    def test_marca_notificacao_como_lida(self, mock_repo):
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        result = use_case.execute(MarkNotificationReadInput(notification_id="notif-456"))

        assert result.success is True

    def test_retorna_false_quando_falha(self, mock_repo):
        mock_repo.mark_as_read.return_value = False
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        result = use_case.execute(MarkNotificationReadInput(notification_id="notif-999"))

        assert result.success is False