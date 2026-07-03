from dataclasses import dataclass
from typing import List, Optional
from domains.opportunities.domain.entities.vacancy import Vacancy
from domains.opportunities.domain.repositories.opportunity_repository import OpportunityRepository


@dataclass
class SearchFilters:
    region: Optional[str] = None
    culture: Optional[str] = None
    vacancy_type: Optional[str] = None


class SearchVacanciesUseCase:

    def __init__(self, repository: OpportunityRepository):
        self._repo = repository

    def execute(self, filters: SearchFilters) -> List[Vacancy]:
        all_vacancies = self._repo.list_opportunities(
            region=filters.region,
            culture=filters.culture,
            vacancy_type=filters.vacancy_type,
        )
        # Ocultar automaticamente as vagas expiradas do feed
        return [v for v in all_vacancies if not v.is_expired()]
