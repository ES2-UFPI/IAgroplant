import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from domains.opportunities.domain.entities.vacancy import Vacancy
from domains.opportunities.domain.repositories.opportunity_repository import OpportunityRepository


@dataclass
class CreateVacancyInput:
    title: str
    description: str
    region: str
    culture: str
    vacancy_type: str  # 'Estágio', 'Emprego', 'Freelance'
    salary: str
    duration: str
    expires_at: datetime
    producer_id: str
    producer_name: str
    producer_role: str  # must be 'Produtor' or 'Produtor Rural' or 'admin'


class CreateVacancyUseCase:

    def __init__(self, repository: OpportunityRepository):
        self._repo = repository

    def execute(self, input_data: CreateVacancyInput) -> Vacancy:
        # Business Rule check: Somente produtores podem cadastrar vagas
        allowed_roles = ["produtor", "produtor rural", "admin"]
        role_normalized = input_data.producer_role.lower()

        if not any(allowed in role_normalized for allowed in allowed_roles):
            raise PermissionError(
                "Somente usuários com perfil Produtor podem cadastrar vagas."
            )

        # Basic validations
        if not input_data.title or not input_data.description:
            raise ValueError("Título e descrição são obrigatórios.")

        if input_data.vacancy_type not in ["Estágio", "Emprego", "Freelance"]:
            raise ValueError(f"Tipo de vaga inválido: {input_data.vacancy_type}")

        # Auto-generate ID and created_at if not present
        vacancy = Vacancy(
            id=str(uuid.uuid4()),
            title=input_data.title,
            description=input_data.description,
            region=input_data.region,
            culture=input_data.culture,
            vacancy_type=input_data.vacancy_type,
            salary=input_data.salary,
            duration=input_data.duration,
            producer_id=input_data.producer_id,
            producer_name=input_data.producer_name,
            expires_at=input_data.expires_at,
            created_at=datetime.now(timezone.utc),
        )

        return self._repo.save_opportunity(vacancy)
