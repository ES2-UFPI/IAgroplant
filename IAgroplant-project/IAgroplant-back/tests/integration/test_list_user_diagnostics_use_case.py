import pytest

pytestmark = pytest.mark.django_db

from domains.ai.application.use_cases.list_user_diagnostics_use_case import (
    ListUserDiagnosticsUseCase,
)

from domains.ai.application.use_cases.save_diagnostic_record_use_case import (
    SaveDiagnosticRecordUseCase,
    SaveDiagnosticRecordInput,
)

from domains.ai.infrastructure.persistence.postgres_diagnostic_record_repository import (
    PostgresDiagnosticRecordRepository,
)


def test_should_list_only_user_records():

    repository = PostgresDiagnosticRecordRepository()

    saver = SaveDiagnosticRecordUseCase(repository)

    saver.execute(

        SaveDiagnosticRecordInput(

            user_id="user-1",

            pathogen="Ferrugem",

            severity="Alta",

            management="A",

            technical_warning="A"

        )

    )

    saver.execute(

        SaveDiagnosticRecordInput(

            user_id="user-2",

            pathogen="Oídio",

            severity="Baixa",

            management="B",

            technical_warning="B"

        )

    )

    records = ListUserDiagnosticsUseCase(

        repository

    ).execute("user-1")

    assert len(records) == 1

    assert records[0].user_id == "user-1"