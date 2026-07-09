from abc import ABC, abstractmethod
from typing import List, Optional
from domains.connections.domain.entities.connection_request import ConnectionRequest


class ConnectionRepository(ABC):

    @abstractmethod
    def save(self, connection: ConnectionRequest) -> ConnectionRequest:
        pass

    @abstractmethod
    def get_by_id(self, connection_id: str) -> Optional[ConnectionRequest]:
        pass

    @abstractmethod
    def list_pending_for_user(self, user_id: str) -> List[ConnectionRequest]:
        pass

    @abstractmethod
    def list_sent_by_user(self, user_id: str) -> List[ConnectionRequest]:
        pass

    @abstractmethod
    def has_pending_request(self, from_user_id: str, to_user_id: str) -> bool:
        pass
