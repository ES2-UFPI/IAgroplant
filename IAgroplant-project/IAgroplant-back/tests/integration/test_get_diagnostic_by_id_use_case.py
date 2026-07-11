import pytest

pytestmark = pytest.mark.django_db


from domains.ai.application.use_cases.get_diagnostic_by_id_use_case import (
    GetDiagnosticByIdUseCase,
)

from domains.ai.application.use_cases.save_diagnostic_record_use_case import (
    SaveDiagnosticRecordUseCase,
    SaveDiagnosticRecordInput,
)

from domains.ai.infrastructure.persistence.postgres_diagnostic_record_repository import (
    PostgresDiagnosticRecordRepository,
)


def test_should_find_saved_record():

    repository = PostgresDiagnosticRecordRepository()

    saved = SaveDiagnosticRecordUseCase(repository).execute(

        SaveDiagnosticRecordInput(

            user_id="123",

            pathogen="Oídio",

            severity="Baixa",

            management="Enxofre",

            technical_warning="Monitorar"

        )

    )

    result = GetDiagnosticByIdUseCase(repository).execute(

        saved.id,

        "123"

    )

    assert result.id == saved.id