from abc import ABC, abstractmethod
from typing import Optional
from domains.auth.domain.entities.user import User


class AuthRepository(ABC):

    @abstractmethod
    def find_by_email(self, email: str) -> Optional[User]:
        """Busca um usuário pelo email."""
        pass

    @abstractmethod
    def find_by_id(self, user_id: str) -> Optional[User]:
        """Busca um usuário pelo ID."""
        pass
