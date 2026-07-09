from dataclasses import dataclass
from domains.reputation.domain.entities.reputation_entry import ReputationEntry
from domains.reputation.domain.entities.reputation_action import CHAT_REPLY_USEFUL
from domains.reputation.domain.repositories.reputation_repository import ReputationRepository
from domains.reputation.application.use_cases.award_reputation_use_case import (
    AwardReputationUseCase,
    AwardReputationInput,
)


@dataclass
class MarkChatReplyUsefulInput:
    marking_user_id: str
    recipient_user_id: str
    message_id: str


class MarkChatReplyUsefulUseCase:

    def __init__(self, repository: ReputationRepository):
        self._repo = repository

    def execute(self, input_data: MarkChatReplyUsefulInput) -> ReputationEntry:
        if input_data.marking_user_id == input_data.recipient_user_id:
            raise ValueError("Não é possível marcar a própria mensagem como útil.")

        return AwardReputationUseCase(repository=self._repo).execute(
            AwardReputationInput(
                user_id=input_data.recipient_user_id,
                action_type=CHAT_REPLY_USEFUL,
                reason="Resposta marcada como útil no chat.",
                reference_id=f"chat:{input_data.message_id}",
            )
        )
