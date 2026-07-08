from dataclasses import dataclass
import uuid

from domains.notifications.domain.entities.notification import Notification, NotificationType
from domains.notifications.domain.repositories.notification_repository import NotificationRepository


@dataclass
class NotifyFeedPostInput:
    user_id: str
    post_id: str
    post_title: str
    tag: str


@dataclass
class NotifyFeedPostOutput:
    notification_id: str
    user_id: str


class NotifyFeedPostUseCase:

    def __init__(
        self,
        notification_repository: NotificationRepository
    ):
        self._repo = notification_repository

    def execute(
        self,
        input_data: NotifyFeedPostInput
    ) -> NotifyFeedPostOutput:

        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=input_data.user_id,
            title="Nova postagem na sua tag seguida",
            body=f"Um novo post sobre '{input_data.tag}' foi publicado: {input_data.post_title}",
            type=NotificationType.FEED_POST,
            metadata={
                "post_id": input_data.post_id,
                "tag": input_data.tag,
            }
        )

        saved = self._repo.create(notification)

        return NotifyFeedPostOutput(
            notification_id=saved.id,
            user_id=saved.user_id,
        )
