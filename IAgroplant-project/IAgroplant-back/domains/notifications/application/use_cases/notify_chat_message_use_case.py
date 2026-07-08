from dataclasses import dataclass
import uuid

from domains.notifications.domain.entities.notification import Notification, NotificationType
from domains.notifications.domain.repositories.notification_repository import NotificationRepository


@dataclass
class NotifyChatMessageInput:
    user_id: str
    sender_name: str
    message_preview: str
    chat_id: str


@dataclass
class NotifyChatMessageOutput:
    notification_id: str
    user_id: str
    title: str
    body: str


class NotifyChatMessageUseCase:

    def __init__(
        self,
        notification_repository: NotificationRepository
    ):
        self._repo = notification_repository

    def execute(
        self,
        input_data: NotifyChatMessageInput
    ) -> NotifyChatMessageOutput:

        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=input_data.user_id,
            title=f"Nova mensagem de {input_data.sender_name}",
            body=input_data.message_preview,
            type=NotificationType.CHAT_MESSAGE,
            metadata={
                "chat_id": input_data.chat_id,
                "sender_name": input_data.sender_name,
            }
        )

        saved = self._repo.create(notification)

        return NotifyChatMessageOutput(
            notification_id=saved.id,
            user_id=saved.user_id,
            title=saved.title,
            body=saved.body,
        )