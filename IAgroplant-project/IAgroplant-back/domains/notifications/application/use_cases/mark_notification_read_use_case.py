from dataclasses import dataclass

from domains.notifications.domain.repositories.notification_repository import NotificationRepository


@dataclass
class MarkNotificationReadInput:
    notification_id: str


@dataclass
class MarkNotificationReadOutput:
    success: bool


class MarkNotificationReadUseCase:

    def __init__(
        self,
        notification_repository: NotificationRepository
    ):
        self._repo = notification_repository

    def execute(
        self,
        input_data: MarkNotificationReadInput
    ) -> MarkNotificationReadOutput:

        success = self._repo.mark_as_read(
            input_data.notification_id
        )

        return MarkNotificationReadOutput(
            success=success
        )