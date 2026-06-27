from abc import ABC, abstractmethod
from typing import List

from domains.notifications.domain.entities.notification import Notification


class NotificationRepository(ABC):

    @abstractmethod
    def create(
        self,
        notification: Notification
    ) -> Notification:
        pass

    @abstractmethod
    def find_by_user_id(
        self,
        user_id: str
    ) -> List[Notification]:
        pass

    @abstractmethod
    def mark_as_read(
        self,
        notification_id: str
    ) -> bool:
        pass