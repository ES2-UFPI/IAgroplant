import uuid
from dataclasses import dataclass
from domains.auth.domain.entities.user import User
from domains.connections.domain.entities.connection_request import ConnectionRequest
from domains.connections.domain.repositories.connection_repository import ConnectionRepository
from domains.users.domain.repositories.user_repository import UserRepository


@dataclass
class SendConnectionRequestInput:
    from_user: User
    to_user_id: str


class SendConnectionRequestUseCase:

    def __init__(self, connection_repository: ConnectionRepository, user_repository: UserRepository):
        self._connections = connection_repository
        self._users = user_repository

    def execute(self, input_data: SendConnectionRequestInput) -> ConnectionRequest:
        from_user = input_data.from_user

        if input_data.to_user_id == from_user.id:
            raise ValueError("Não é possível enviar uma conexão para si mesmo.")

        to_user = self._users.get_by_id(input_data.to_user_id)
        if not to_user:
            raise ValueError("Usuário de destino não encontrado.")

        if self._connections.has_pending_request(from_user.id, input_data.to_user_id):
            raise ValueError("Já existe uma solicitação de conexão pendente para este usuário.")

        request = ConnectionRequest(
            id=str(uuid.uuid4()),
            from_user_id=from_user.id,
            from_user_name=from_user.name,
            to_user_id=to_user.id,
            to_user_name=to_user.name,
        )
        return self._connections.save(request)
