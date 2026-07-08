from datetime import datetime, timedelta, timezone
from typing import List, Optional
from domains.opportunities.domain.entities.vacancy import Vacancy
from domains.opportunities.domain.entities.application import Application
from domains.opportunities.domain.repositories.opportunity_repository import OpportunityRepository


class PostgresOpportunityRepository(OpportunityRepository):
    # In-memory storage to serve as a mock/stub that simulates database tables.
    _vacancies: List[Vacancy] = []
    _applications: List[Application] = []
    _initialized = False

    def __init__(self):
        if not PostgresOpportunityRepository._initialized:
            self._prepopulate_mock_data()
            PostgresOpportunityRepository._initialized = True

    def _prepopulate_mock_data(self):
        now = datetime.now(timezone.utc)
        
        # Vaga 1: Ativa - Estágio
        v1 = Vacancy(
            id="vaga-1",
            title="Estagiário em Agronomia",
            description="Acompanhamento de manejo de lavoura de soja e milho. Auxílio na coleta de dados de pragas.",
            region="Mato Grosso",
            culture="Soja",
            vacancy_type="Estágio",
            salary="R$ 1.500,00",
            duration="6 meses",
            producer_id="demo-producer-1",
            producer_name="Fazenda Boa Vista",
            expires_at=now + timedelta(days=15),
            created_at=now - timedelta(days=2),
        )

        # Vaga 2: Ativa - Emprego
        v2 = Vacancy(
            id="vaga-2",
            title="Agrônomo de Vendas",
            description="Profissional formado para consultoria técnica e vendas de insumos agrícolas na região.",
            region="Goiás",
            culture="Milho",
            vacancy_type="Emprego",
            salary="R$ 6.000,00",
            duration="CLT",
            producer_id="demo-producer-2",
            producer_name="Sementes Cerrado",
            expires_at=now + timedelta(days=30),
            created_at=now - timedelta(days=5),
        )

        # Vaga 3: Expirada - Deve ser ocultada automaticamente
        v3 = Vacancy(
            id="vaga-3",
            title="Freelance - Vistoria de Lavouras",
            description="Vistoria pontual para emissão de laudo técnico em plantio de café.",
            region="Minas Gerais",
            culture="Café",
            vacancy_type="Freelance",
            salary="R$ 1.200,00",
            duration="3 dias",
            producer_id="demo-producer-1",
            producer_name="Fazenda Boa Vista",
            expires_at=now - timedelta(days=1),  # Expirou ontem!
            created_at=now - timedelta(days=6),
        )

        PostgresOpportunityRepository._vacancies.extend([v1, v2, v3])

    def save_opportunity(self, vacancy: Vacancy) -> Vacancy:
        # Check if already exists to update, else append
        for idx, v in enumerate(PostgresOpportunityRepository._vacancies):
            if v.id == vacancy.id:
                PostgresOpportunityRepository._vacancies[idx] = vacancy
                return vacancy
        PostgresOpportunityRepository._vacancies.append(vacancy)
        return vacancy

    def get_opportunity_by_id(self, opportunity_id: str) -> Optional[Vacancy]:
        for v in PostgresOpportunityRepository._vacancies:
            if v.id == opportunity_id:
                return v
        return None

    def list_opportunities(
        self,
        region: Optional[str] = None,
        culture: Optional[str] = None,
        vacancy_type: Optional[str] = None,
    ) -> List[Vacancy]:
        result = PostgresOpportunityRepository._vacancies[:]
        
        if region:
            result = [v for v in result if region.lower() in v.region.lower()]
        if culture:
            result = [v for v in result if culture.lower() in v.culture.lower()]
        if vacancy_type:
            result = [v for v in result if vacancy_type.lower() == v.vacancy_type.lower()]
            
        return result

    def save_application(self, application: Application) -> Application:
        for idx, app in enumerate(PostgresOpportunityRepository._applications):
            if app.id == application.id:
                PostgresOpportunityRepository._applications[idx] = application
                return application
        PostgresOpportunityRepository._applications.append(application)
        return application

    def get_applications_by_user(self, user_id: str) -> List[Application]:
        return [
            app for app in PostgresOpportunityRepository._applications if app.user_id == user_id
        ]

    def get_applications_by_opportunity(self, opportunity_id: str) -> List[Application]:
        return [
            app
            for app in PostgresOpportunityRepository._applications
            if app.opportunity_id == opportunity_id
        ]
