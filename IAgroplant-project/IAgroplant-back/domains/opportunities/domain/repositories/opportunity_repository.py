from abc import ABC, abstractmethod
from typing import List, Optional
from domains.opportunities.domain.entities.vacancy import Vacancy
from domains.opportunities.domain.entities.application import Application


class OpportunityRepository(ABC):

    @abstractmethod
    def save_opportunity(self, vacancy: Vacancy) -> Vacancy:
        pass

    @abstractmethod
    def get_opportunity_by_id(self, opportunity_id: str) -> Optional[Vacancy]:
        pass

    @abstractmethod
    def list_opportunities(
        self,
        region: Optional[str] = None,
        culture: Optional[str] = None,
        vacancy_type: Optional[str] = None,
    ) -> List[Vacancy]:
        pass

    @abstractmethod
    def save_application(self, application: Application) -> Application:
        pass

    @abstractmethod
    def get_applications_by_user(self, user_id: str) -> List[Application]:
        pass

    @abstractmethod
    def get_applications_by_opportunity(self, opportunity_id: str) -> List[Application]:
        pass
