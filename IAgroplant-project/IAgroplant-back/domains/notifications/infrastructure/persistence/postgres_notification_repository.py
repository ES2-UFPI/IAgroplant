from typing import List

from domains.notifications.domain.entities.notification import Notification
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