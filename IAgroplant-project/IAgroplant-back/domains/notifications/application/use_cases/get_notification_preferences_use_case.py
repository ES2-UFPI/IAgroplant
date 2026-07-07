from dataclasses import dataclass
from typing import List

from domains.notifications.domain.entities.notification import NotificationPreference
from domains.notifications.domain.repositories.notification_repository import NotificationRepository


@dataclass
class GetNotificationPreferencesInput:
    user_id: str


@dataclass
class GetNotificationPreferencesOutput:
    preferences: List[NotificationPreference]


class GetNotificationPreferencesUseCase:

    def __init__(
        self,
        notification_repository: NotificationRepository
    ):
        self._repo = notification_repository

    def execute(
        self,
        input_data: GetNotificationPreferencesInput
    ) -> GetNotificationPreferencesOutput:

        preferences = self._repo.get_preferences(
            input_data.user_id
        )

        return GetNotificationPreferencesOutput(
            preferences=preferences
        )