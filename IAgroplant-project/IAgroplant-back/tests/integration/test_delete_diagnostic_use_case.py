import pytest

pytestmark = pytest.mark.django_db

from domains.ai.application.use_cases.delete_diagnostic_use_case import (
    DeleteDiagnosticUseCase,
    DeleteDiagnosticInput,
)

from domains.ai.application.use_cases.save_diagnostic_record_use_case import (
    SaveDiagnosticRecordUseCase,
    SaveDiagnosticRecordInput,
)

from domains.ai.infrastructure.persistence.postgres_diagnostic_record_repository import (
    PostgresDiagnosticRecordRepository,
)


def test_should_delete_record():

    repository = PostgresDiagnosticRecordRepository()

    saved = SaveDiagnosticRecordUseCase(repository).execute(

        SaveDiagnosticRecordInput(

            user_id="1",

            pathogen="Ferrugem",

            severity="Alta",

            management="Teste",

            technical_warning="Teste"

        )

    )

    DeleteDiagnosticUseCase(repository).execute(

        DeleteDiagnosticInput(

            record_id=saved.id,

            user_id="1"

        )

    )

    assert repository.get_by_id(saved.id) is None