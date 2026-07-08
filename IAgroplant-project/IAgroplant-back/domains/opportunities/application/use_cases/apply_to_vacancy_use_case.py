import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from domains.opportunities.domain.entities.application import Application
from domains.opportunities.domain.repositories.opportunity_repository import OpportunityRepository


@dataclass
class ApplyToVacancyInput:
    vacancy_id: str
    user_id: str
    user_name: str
    user_role: str  # must be 'Estudante' or 'Técnico' or 'admin'


class ApplyToVacancyUseCase:

    def __init__(self, repository: OpportunityRepository, notification_service):
        self._repo = repository
        self._notification_service = notification_service

    def execute(self, input_data: ApplyToVacancyInput) -> Application:
        # Business Rule check: Somente Estudante ou Técnico podem se candidatar
        allowed_roles = ["estudante", "técnico", "tecnico", "admin"]
        role_normalized = input_data.user_role.lower()

        if not any(allowed in role_normalized for allowed in allowed_roles):
            raise PermissionError(
                "Somente usuários com perfil Estudante ou Técnico podem se candidatar."
            )

        # Get vacancy and check if it exists
        vacancy = self._repo.get_opportunity_by_id(input_data.vacancy_id)
        if not vacancy:
            raise ValueError("Vaga não encontrada.")

        # Business Rule check: Vagas expiradas não admitem candidatura
        if vacancy.is_expired():
            raise ValueError("Esta vaga já expirou e não aceita mais candidaturas.")

        # Check if already applied to prevent duplicates
        existing_applications = self._repo.get_applications_by_user(input_data.user_id)
        for app in existing_applications:
            if app.opportunity_id == input_data.vacancy_id:
                raise ValueError("Você já se candidatou a esta vaga.")

        # Create application
        application = Application(
            id=str(uuid.uuid4()),
            opportunity_id=vacancy.id,
            user_id=input_data.user_id,
            user_name=input_data.user_name,
            user_role=input_data.user_role,
            applied_at=datetime.now(timezone.utc),
            status="Pendente",
        )

        saved_app = self._repo.save_application(application)

        # Trigger push notification to producer
        # Flow: NotificationModule.publish(NOVA_CANDIDATURA) -> Produtor recebe push
        self._notification_service.send_push_notification(
            recipient_id=vacancy.producer_id,
            title="Nova Candidatura Recebida!",
            body=f"{input_data.user_name} se candidatou para a vaga '{vacancy.title}'.",
            data={
                "type": "NOVA_CANDIDATURA",
                "opportunity_id": vacancy.id,
                "application_id": saved_app.id,
            }
        )

        return saved_app
