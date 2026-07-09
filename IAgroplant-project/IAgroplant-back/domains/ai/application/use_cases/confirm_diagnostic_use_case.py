from dataclasses import dataclass, replace
from datetime import datetime, timezone
from domains.auth.domain.entities.user import User
from domains.ai.domain.entities.diagnostic_record import DiagnosticRecord
from domains.ai.domain.repositories.diagnostic_record_repository import DiagnosticRecordRepository
from domains.reputation.domain.repositories.reputation_repository import ReputationRepository
from domains.reputation.domain.entities.reputation_action import DIAGNOSIS_CONFIRMED
from domains.reputation.application.use_cases.award_reputation_use_case import (
    AwardReputationUseCase,
    AwardReputationInput,
)


@dataclass
class ConfirmDiagnosticInput:
    record_id: str
    confirming_user: User


class ConfirmDiagnosticUseCase:

    def __init__(self, record_repository: DiagnosticRecordRepository, reputation_repository: ReputationRepository):
        self._records = record_repository
        self._reputation = reputation_repository

    def execute(self, input_data: ConfirmDiagnosticInput) -> DiagnosticRecord:
        confirming_user = input_data.confirming_user
        if not confirming_user.certificado:
            raise PermissionError("Somente profissionais certificados podem confirmar diagnósticos.")

        record = self._records.get_by_id(input_data.record_id)
        if not record:
            raise ValueError("Diagnóstico não encontrado.")

        if record.user_id == confirming_user.id:
            raise ValueError("Não é possível confirmar o próprio diagnóstico.")

        if record.confirmed:
            raise ValueError("Este diagnóstico já foi confirmado.")

        updated = replace(
            record,
            confirmed=True,
            confirmed_by=confirming_user.id,
            confirmed_at=datetime.now(timezone.utc),
        )
        self._records.save(updated)

        AwardReputationUseCase(repository=self._reputation).execute(
            AwardReputationInput(
                user_id=record.user_id,
                action_type=DIAGNOSIS_CONFIRMED,
                reason=f"Diagnóstico confirmado por {confirming_user.name}.",
                reference_id=f"diagnostic:{record.id}",
            )
        )

        return updated
