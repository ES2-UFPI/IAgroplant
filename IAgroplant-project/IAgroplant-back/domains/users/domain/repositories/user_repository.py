from abc import ABC, abstractmethod
from typing import Optional
from domains.auth.domain.entities.user import User


class UserRepository(ABC):

    @abstractmethod
    def get_by_id(self, user_id: str) -> Optional[User]:
        pass

    @abstractmethod
    def update(self, user: User) -> User:
        pass
