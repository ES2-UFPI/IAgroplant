from dataclasses import dataclass
from typing import List

from domains.notifications.domain.entities.notification import NotificationPreference
from domains.notifications.domain.repositories.notification_repository import NotificationRepository


@dataclass
class UpdateNotificationPreferencesInput:
    user_id: str
    preferences: List[NotificationPreference]


@dataclass
class UpdateNotificationPreferencesOutput:
    preferences: List[NotificationPreference]


class UpdateNotificationPreferencesUseCase:

    def __init__(
        self,
        notification_repository: NotificationRepository
    ):
        self._repo = notification_repository

    def execute(
        self,
        input_data: UpdateNotificationPreferencesInput
    ) -> UpdateNotificationPreferencesOutput:

        updated = self._repo.update_preferences(
            input_data.user_id,
            input_data.preferences
        )

        return UpdateNotificationPreferencesOutput(
            preferences=updated
        )