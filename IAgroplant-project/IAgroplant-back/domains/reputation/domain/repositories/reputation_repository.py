from abc import ABC, abstractmethod
from typing import List
from domains.reputation.domain.entities.reputation_entry import ReputationEntry


class ReputationRepository(ABC):

    @abstractmethod
    def add_entry(self, entry: ReputationEntry) -> ReputationEntry:
        pass

    @abstractmethod
    def get_entries_by_user(self, user_id: str) -> List[ReputationEntry]:
        pass

    @abstractmethod
    def has_entry_reference(self, reference_id: str) -> bool:
        pass
