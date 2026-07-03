from typing import List
from domains.opportunities.domain.entities.application import Application
from domains.opportunities.domain.repositories.opportunity_repository import OpportunityRepository


class GetUserApplicationsUseCase:

    def __init__(self, repository: OpportunityRepository):
        self._repo = repository

    def execute(self, user_id: str) -> List[Application]:
        return self._repo.get_applications_by_user(user_id)
