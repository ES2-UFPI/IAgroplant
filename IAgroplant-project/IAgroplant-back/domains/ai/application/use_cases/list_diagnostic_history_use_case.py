from domains.ai.application.dto.diagnostic_history_item import (
    DiagnosticHistoryItem,
)

from domains.ai.domain.repositories.diagnostic_record_repository import (
    DiagnosticRecordRepository,
)


class ListDiagnosticHistoryUseCase:

    def __init__(
        self,
        repository: DiagnosticRecordRepository,
    ):
        self._repository = repository

    def execute(
        self,
        user_id: str,
    ) -> list[DiagnosticHistoryItem]:

        records = self._repository.list_by_user(
            user_id
        )

        history = []

        for record in records:

            history.append(

                DiagnosticHistoryItem(

                    id=record.id,

                    pathogen=record.pathogen,

                    severity=record.severity,

                    management=record.management,

                    technical_warning=record.technical_warning,

                    confirmed=record.confirmed,

                    confirmed_by=record.confirmed_by,

                    confirmed_at=record.confirmed_at,

                    created_at=record.created_at,

                )

            )

        return history