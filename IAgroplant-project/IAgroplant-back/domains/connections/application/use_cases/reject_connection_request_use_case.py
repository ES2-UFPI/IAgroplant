from dataclasses import dataclass, replace
from datetime import datetime, timezone
from domains.auth.domain.entities.user import User
from domains.connections.domain.entities.connection_request import ConnectionRequest
from domains.connections.domain.repositories.connection_repository import ConnectionRepository


@dataclass
class RejectConnectionRequestInput:
    connection_id: str
    acting_user: User


class RejectConnectionRequestUseCase:

    def __init__(self, connection_repository: ConnectionRepository):
        self._connections = connection_repository

    def execute(self, input_data: RejectConnectionRequestInput) -> ConnectionRequest:
        acting_user = input_data.acting_user

        connection = self._connections.get_by_id(input_data.connection_id)
        if not connection:
            raise ValueError("Solicitação de conexão não encontrada.")

        if connection.to_user_id != acting_user.id:
            raise PermissionError("Somente o destinatário da solicitação pode rejeitá-la.")

        if connection.status != "pending":
            raise ValueError("Esta solicitação de conexão já foi respondida.")

        updated = replace(
            connection,
            status="rejected",
            responded_at=datetime.now(timezone.utc),
        )
        return self._connections.save(updated)
