from typing import List, Optional
from datetime import timezone

from backend.persistence.models import DiagnosticRecordModel

from domains.ai.domain.entities.diagnostic_record import DiagnosticRecord
from domains.ai.domain.repositories.diagnostic_record_repository import (
    DiagnosticRecordRepository,
)


class PostgresDiagnosticRecordRepository(
    DiagnosticRecordRepository
):

    def save(
        self,
        record: DiagnosticRecord,
    ) -> DiagnosticRecord:

        DiagnosticRecordModel.objects.update_or_create(

            id=record.id,

            defaults={

                "user_id": record.user_id,

                "pathogen": record.pathogen,

                "severity": record.severity,

                "management": record.management,

                "technical_warning": record.technical_warning,

                "confirmed": record.confirmed,

            },

        )

        return record

    def get_by_id(
        self,
        record_id: str,
    ) -> Optional[DiagnosticRecord]:

        try:

            model = DiagnosticRecordModel.objects.get(
                id=record_id
            )

            return self._to_entity(
                model
            )

        except DiagnosticRecordModel.DoesNotExist:

            return None

    def list_by_user(
        self,
        user_id: str,
    ) -> List[DiagnosticRecord]:

        queryset = DiagnosticRecordModel.objects.filter(
            user_id=user_id
        ).order_by(
            "-created_at"
        )

        return [

            self._to_entity(item)

            for item in queryset

        ]

    def list_pending_confirmation(
        self,
    ) -> List[DiagnosticRecord]:

        queryset = DiagnosticRecordModel.objects.filter(
            confirmed=False
        ).order_by(
            "-created_at"
        )

        return [

            self._to_entity(item)

            for item in queryset

        ]

    def _to_entity(
        self,
        model: DiagnosticRecordModel,
    ) -> DiagnosticRecord:

        created = model.created_at

        if created.tzinfo is None:

            created = created.replace(
                tzinfo=timezone.utc
            )

        return DiagnosticRecord(

            id=model.id,

            user_id=model.user_id,

            pathogen=model.pathogen,

            severity=model.severity,

            management=model.management,

            technical_warning=model.technical_warning,

            confirmed=model.confirmed,

            created_at=created,

        )