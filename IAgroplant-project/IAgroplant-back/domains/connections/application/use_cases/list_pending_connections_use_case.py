from typing import List
from domains.connections.domain.entities.connection_request import ConnectionRequest
from domains.connections.domain.repositories.connection_repository import ConnectionRepository


class ListPendingConnectionsUseCase:

    def __init__(self, repository: ConnectionRepository):
        self._repo = repository

    def execute(self, user_id: str) -> List[ConnectionRequest]:
        return self._repo.list_pending_for_user(user_id)
