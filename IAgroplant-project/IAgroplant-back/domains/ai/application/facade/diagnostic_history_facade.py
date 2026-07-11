from domains.ai.application.use_cases.list_diagnostic_history_use_case import (
    ListDiagnosticHistoryUseCase,
)

from domains.ai.domain.repositories.diagnostic_record_repository import (
    DiagnosticRecordRepository,
)


class DiagnosticHistoryFacade:

    def __init__(
        self,
        repository: DiagnosticRecordRepository,
    ):

        self._use_case = ListDiagnosticHistoryUseCase(
            repository
        )

    def list_history(
        self,
        user_id: str,
    ):

        return self._use_case.execute(
            user_id
        )