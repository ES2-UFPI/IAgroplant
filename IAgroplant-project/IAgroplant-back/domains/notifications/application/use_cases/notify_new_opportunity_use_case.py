from dataclasses import dataclass
import uuid

from domains.notifications.domain.entities.notification import Notification, NotificationType
from domains.notifications.domain.repositories.notification_repository import NotificationRepository


@dataclass
class NotifyNewOpportunityInput:
    user_id: str
    opportunity_id: str
    opportunity_title: str
    location: str


@dataclass
class NotifyNewOpportunityOutput:
    notification_id: str
    user_id: str
    title: str
    body: str


class NotifyNewOpportunityUseCase:

    def __init__(
        self,
        notification_repository: NotificationRepository
    ):
        self._repo = notification_repository

    def execute(
        self,
        input_data: NotifyNewOpportunityInput
    ) -> NotifyNewOpportunityOutput:

        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=input_data.user_id,
            title="Nova oportunidade disponível!",
            body=f"'{input_data.opportunity_title}' em {input_data.location}",
            type=NotificationType.OPPORTUNITY,
            metadata={
                "opportunity_id": input_data.opportunity_id,
                "location": input_data.location,
            }
        )

        saved = self._repo.create(notification)

        return NotifyNewOpportunityOutput(
            notification_id=saved.id,
            user_id=saved.user_id,
            title=saved.title,
            body=saved.body,
        )