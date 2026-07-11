from dataclasses import dataclass

from domains.ai.domain.repositories.diagnostic_record_repository import (
    DiagnosticRecordRepository,
)


@dataclass
class DeleteDiagnosticInput:

    record_id: str

    user_id: str


class DeleteDiagnosticUseCase:

    def __init__(
        self,
        repository: DiagnosticRecordRepository,
    ):
        self._repository = repository

    def execute(
        self,
        input_data: DeleteDiagnosticInput,
    ):

        record = self._repository.get_by_id_and_user(

            input_data.record_id,

            input_data.user_id,

        )

        if record is None:

            raise ValueError(
                "Diagnóstico não encontrado."
            )

        self._repository.delete(
            input_data.record_id
        )