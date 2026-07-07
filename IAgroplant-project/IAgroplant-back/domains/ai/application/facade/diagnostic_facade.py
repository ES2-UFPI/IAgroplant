from domains.ai.application.dto.diagnostic_input import DiagnosticInput

from domains.ai.application.use_cases.diagnose_use_case import DiagnoseUseCase

from domains.ai.domain.repositories.ai_repository import AIProvider


class DiagnosticFacade:

    def __init__(
        self,
        repository: AIProvider,
    ):

        self._use_case = DiagnoseUseCase(
            repository
        )

    def diagnose(
        self,
        image_bytes: bytes,
        description: str,
    ):

        dto = DiagnosticInput(

            image_bytes=image_bytes,

            description=description,

        )

        return self._use_case.execute(
            dto
        )