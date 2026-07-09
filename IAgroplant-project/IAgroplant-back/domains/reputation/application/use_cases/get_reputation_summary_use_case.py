from dataclasses import dataclass
from typing import List
from domains.reputation.domain.entities.reputation_entry import ReputationEntry
from domains.reputation.domain.repositories.reputation_repository import ReputationRepository


@dataclass
class ReputationSummary:
    total: int
    entries: List[ReputationEntry]


class GetReputationSummaryUseCase:

    def __init__(self, repository: ReputationRepository):
        self._repo = repository

    def execute(self, user_id: str) -> ReputationSummary:
        entries = self._repo.get_entries_by_user(user_id)
        # O total nunca é um contador cacheado — é sempre a soma do ledger,
        # para evitar dessincronia entre o valor exibido e o histórico real.
        entries_sorted = sorted(entries, key=lambda e: e.created_at, reverse=True)
        total = sum(e.points for e in entries)
        return ReputationSummary(total=total, entries=entries_sorted)
