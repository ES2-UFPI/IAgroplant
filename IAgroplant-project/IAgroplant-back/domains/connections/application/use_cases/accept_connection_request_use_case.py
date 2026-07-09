from dataclasses import dataclass, replace
from datetime import datetime, timezone
from domains.auth.domain.entities.user import User
from domains.connections.domain.entities.connection_request import ConnectionRequest
from domains.connections.domain.repositories.connection_repository import ConnectionRepository
from domains.reputation.domain.repositories.reputation_repository import ReputationRepository
from domains.reputation.domain.entities.reputation_action import CONNECTION_ACCEPTED
from domains.reputation.application.use_cases.award_reputation_use_case import (
    AwardReputationUseCase,
    AwardReputationInput,
)


@dataclass
class AcceptConnectionRequestInput:
    connection_id: str
    acting_user: User


class AcceptConnectionRequestUseCase:

    def __init__(self, connection_repository: ConnectionRepository, reputation_repository: ReputationRepository):
        self._connections = connection_repository
        self._reputation = reputation_repository

    def execute(self, input_data: AcceptConnectionRequestInput) -> ConnectionRequest:
        acting_user = input_data.acting_user

        connection = self._connections.get_by_id(input_data.connection_id)
        if not connection:
            raise ValueError("Solicitação de conexão não encontrada.")

        if connection.to_user_id != acting_user.id:
            raise PermissionError("Somente o destinatário da solicitação pode aceitá-la.")

        if not acting_user.certificado:
            raise PermissionError("Somente profissionais certificados podem aceitar conexões.")

        if connection.status != "pending":
            raise ValueError("Esta solicitação de conexão já foi respondida.")

        updated = replace(
            connection,
            status="accepted",
            responded_at=datetime.now(timezone.utc),
        )
        self._connections.save(updated)

        AwardReputationUseCase(repository=self._reputation).execute(
            AwardReputationInput(
                user_id=connection.from_user_id,
                action_type=CONNECTION_ACCEPTED,
                reason=f"Conexão aceita por {acting_user.name}.",
                reference_id=f"connection:{connection.id}",
            )
        )

        return updated
