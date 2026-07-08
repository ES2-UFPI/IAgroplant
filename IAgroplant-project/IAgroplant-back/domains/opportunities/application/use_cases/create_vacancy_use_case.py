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

    def __init__(
        self,
        repository: OpportunityRepository,
        user_repository = None,
        notification_repository = None
    ):
        self._repo = repository
        self._user_repo = user_repository
        self._notification_repo = notification_repository

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

        saved_vacancy = self._repo.save_opportunity(vacancy)

        # Proximity notification check for internships
        if saved_vacancy.vacancy_type == "Estágio":
            user_repo = self._user_repo
            if user_repo is None:
                from shared.utils.repository_factory import get_user_repository
                user_repo = get_user_repository()

            notification_repo = self._notification_repo
            if notification_repo is None:
                from shared.utils.repository_factory import get_notification_repository
                notification_repo = get_notification_repository()

            # Find student users in the same region
            students = user_repo.find_by_role_and_region(role="estudante", region=saved_vacancy.region)

            for student in students:
                from domains.notifications.domain.entities.notification import Notification, NotificationType
                
                notif = Notification(
                    id=str(uuid.uuid4()),
                    user_id=student.id,
                    title="Novo Estágio na sua Região!",
                    body=f"A vaga '{saved_vacancy.title}' está disponível em {saved_vacancy.region}.",
                    type=NotificationType.OPPORTUNITY,
                    is_read=False,
                    created_at=datetime.now(timezone.utc),
                    metadata={
                        "vacancy_id": saved_vacancy.id,
                        "culture": saved_vacancy.culture,
                        "salary": saved_vacancy.salary,
                    }
                )
                notification_repo.create(notif)

                # Send push notification
                try:
                    from domains.opportunities.infrastructure.notifications.notification_service import NotificationService
                    push_service = NotificationService()
                    push_service.send_push_notification(
                        recipient_id=student.id,
                        title=notif.title,
                        body=notif.body,
                        data=notif.metadata
                    )
                except Exception:
                    pass

        return saved_vacancy

