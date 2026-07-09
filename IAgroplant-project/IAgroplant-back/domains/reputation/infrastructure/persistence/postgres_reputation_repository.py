from typing import List
from domains.reputation.domain.entities.reputation_entry import ReputationEntry
from domains.reputation.domain.repositories.reputation_repository import ReputationRepository


class PostgresReputationRepository(ReputationRepository):
    # In-memory storage to serve as a mock/stub that simulates a database table.
    _entries: List[ReputationEntry] = []

    def add_entry(self, entry: ReputationEntry) -> ReputationEntry:
        PostgresReputationRepository._entries.append(entry)
        return entry

    def get_entries_by_user(self, user_id: str) -> List[ReputationEntry]:
        return [e for e in PostgresReputationRepository._entries if e.user_id == user_id]

    def has_entry_reference(self, reference_id: str) -> bool:
        return any(
            e.reference_id == reference_id for e in PostgresReputationRepository._entries
        )
