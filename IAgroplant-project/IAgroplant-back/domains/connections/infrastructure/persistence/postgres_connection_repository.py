from typing import List, Optional
from domains.connections.domain.entities.connection_request import ConnectionRequest
from domains.connections.domain.repositories.connection_repository import ConnectionRepository


class PostgresConnectionRepository(ConnectionRepository):
    # In-memory storage to serve as a mock/stub that simulates a database table.
    _connections: List[ConnectionRequest] = []

    def save(self, connection: ConnectionRequest) -> ConnectionRequest:
        for idx, c in enumerate(PostgresConnectionRepository._connections):
            if c.id == connection.id:
                PostgresConnectionRepository._connections[idx] = connection
                return connection
        PostgresConnectionRepository._connections.append(connection)
        return connection

    def get_by_id(self, connection_id: str) -> Optional[ConnectionRequest]:
        for c in PostgresConnectionRepository._connections:
            if c.id == connection_id:
                return c
        return None

    def list_pending_for_user(self, user_id: str) -> List[ConnectionRequest]:
        return [
            c for c in PostgresConnectionRepository._connections
            if c.to_user_id == user_id and c.status == "pending"
        ]

    def list_sent_by_user(self, user_id: str) -> List[ConnectionRequest]:
        return [c for c in PostgresConnectionRepository._connections if c.from_user_id == user_id]

    def has_pending_request(self, from_user_id: str, to_user_id: str) -> bool:
        return any(
            c.from_user_id == from_user_id and c.to_user_id == to_user_id and c.status == "pending"
            for c in PostgresConnectionRepository._connections
        )
