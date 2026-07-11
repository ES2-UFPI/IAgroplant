from domains.ai.domain.repositories.diagnostic_record_repository import (
    DiagnosticRecordRepository,
)


class GetDiagnosticByIdUseCase:

    def __init__(
        self,
        repository: DiagnosticRecordRepository,
    ):
        self._repository = repository

    def execute(
        self,
        record_id: str,
        user_id: str,
    ):

        record = self._repository.get_by_id_and_user(

            record_id,

            user_id,

        )

        if record is None:

            raise ValueError(
                "Diagnóstico não encontrado."
            )

        return record