import pytest

pytestmark = pytest.mark.django_db



from domains.ai.application.use_cases.save_diagnostic_record_use_case import (
    SaveDiagnosticRecordUseCase,
    SaveDiagnosticRecordInput,
)

from domains.ai.infrastructure.persistence.postgres_diagnostic_record_repository import (
    PostgresDiagnosticRecordRepository,
)


def test_should_save_record():

    repository = PostgresDiagnosticRecordRepository()

    use_case = SaveDiagnosticRecordUseCase(repository)

    record = use_case.execute(

        SaveDiagnosticRecordInput(

            user_id="user-1",

            pathogen="Ferrugem",

            severity="Alta",

            management="Aplicar fungicida",

            technical_warning="Monitorar"

        )

    )

    assert record.id is not None

    assert record.user_id == "user-1"

    assert record.pathogen == "Ferrugem"