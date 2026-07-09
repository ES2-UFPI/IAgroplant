from typing import List
from domains.connections.domain.entities.connection_request import ConnectionRequest
from domains.connections.domain.repositories.connection_repository import ConnectionRepository


class ListSentConnectionsUseCase:

    def __init__(self, repository: ConnectionRepository):
        self._repo = repository

    def execute(self, user_id: str) -> List[ConnectionRequest]:
        return self._repo.list_sent_by_user(user_id)
