from typing import List

from domains.notifications.domain.entities.notification import Notification, NotificationPreference
from domains.notifications.domain.repositories.notification_repository import NotificationRepository


class PostgresNotificationRepository(NotificationRepository):

    def create(
        self,
        notification: Notification
    ) -> Notification:
        # TODO: implementar persistência real no banco
        return notification

    def find_by_user_id(
        self,
        user_id: str
    ) -> List[Notification]:
        # TODO: implementar busca real no banco
        return []

    def mark_as_read(
        self,
        notification_id: str
    ) -> bool:
        # TODO: implementar atualização real no banco
        return True

    def get_preferences(
        self,
        user_id: str
    ) -> List[NotificationPreference]:
        # TODO: implementar busca real no banco
        return [
            NotificationPreference(user_id=user_id, type="FEED_POST", enabled=True),
            NotificationPreference(user_id=user_id, type="CHAT_MESSAGE", enabled=True),
            NotificationPreference(user_id=user_id, type="OPPORTUNITY", enabled=True),
            NotificationPreference(user_id=user_id, type="SYSTEM", enabled=True),
        ]

    def update_preferences(
        self,
        user_id: str,
        preferences: List[NotificationPreference]
    ) -> List[NotificationPreference]:
        # TODO: implementar atualização real no banco
        return preferences
    