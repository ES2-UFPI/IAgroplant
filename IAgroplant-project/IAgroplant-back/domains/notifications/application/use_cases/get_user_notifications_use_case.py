from dataclasses import dataclass
from typing import List

from domains.notifications.domain.repositories.notification_repository import NotificationRepository
from domains.notifications.domain.entities.notification import Notification


@dataclass
class GetUserNotificationsInput:
    user_id: str


@dataclass
class GetUserNotificationsOutput:
    notifications: List[Notification]


class GetUserNotificationsUseCase:

    def __init__(
        self,
        notification_repository: NotificationRepository
    ):
        self._repo = notification_repository

    def execute(
        self,
        input_data: GetUserNotificationsInput
    ) -> GetUserNotificationsOutput:

        notifications = self._repo.find_by_user_id(
            input_data.user_id
        )

        return GetUserNotificationsOutput(
            notifications=notifications
        )