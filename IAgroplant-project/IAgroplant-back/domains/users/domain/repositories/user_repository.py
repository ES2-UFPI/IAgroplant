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

    @abstractmethod
    def get_initial_guidance_status(self, user_id: str) -> Optional[User]:
        pass

    @abstractmethod
    def mark_initial_guidance_completed(self, user_id: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_interactive_onboarding_status(self, user_id: str) -> Optional[User]:
        pass

    @abstractmethod
    def mark_interactive_onboarding_completed(self, user_id: str) -> Optional[User]:
        pass

    @abstractmethod
    def find_by_role_and_region(self, role: str, region: str) -> list[User]:
        pass

    @abstractmethod
    def search_specialists(self, topic: str, region: Optional[str] = None) -> list[User]:
        pass
