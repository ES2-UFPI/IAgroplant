import uuid
from dataclasses import dataclass
from typing import Optional
from domains.reputation.domain.entities.reputation_entry import ReputationEntry
from domains.reputation.domain.entities.reputation_action import POINTS_TABLE
from domains.reputation.domain.repositories.reputation_repository import ReputationRepository


@dataclass
class AwardReputationInput:
    user_id: str
    action_type: str
    reason: Optional[str] = None
    reference_id: Optional[str] = None


class AwardReputationUseCase:

    def __init__(self, repository: ReputationRepository):
        self._repo = repository

    def execute(self, input_data: AwardReputationInput) -> ReputationEntry:
        if input_data.action_type not in POINTS_TABLE:
            raise ValueError(f"Ação de reputação desconhecida: {input_data.action_type}")

        if input_data.reference_id and self._repo.has_entry_reference(input_data.reference_id):
            raise ValueError("Esta ação já concedeu pontos de reputação anteriormente.")

        entry = ReputationEntry(
            id=str(uuid.uuid4()),
            user_id=input_data.user_id,
            action_type=input_data.action_type,
            points=POINTS_TABLE[input_data.action_type],
            reason=input_data.reason,
            reference_id=input_data.reference_id,
        )
        return self._repo.add_entry(entry)
