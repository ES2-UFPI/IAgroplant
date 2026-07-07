from domains.ai.application.dto.diagnostic_input import DiagnosticInput
from domains.ai.application.dto.diagnostic_result import DiagnosticResult

from domains.ai.domain.repositories.ai_repository import AIProvider

from domains.ai.domain.services.image_processor import ImageProcessor
from domains.ai.domain.services.prompt_builder import PromptBuilder
from domains.ai.domain.services.response_formatter import ResponseFormatter


class DiagnoseUseCase:

    def __init__(self, repository: AIProvider):

        self._repository = repository

    def execute(
        self,
        input_data: DiagnosticInput,
    ) -> DiagnosticResult:
        if not input_data.image_bytes:

            raise ValueError(
                "Imagem não enviada"
            )

        processed_image = ImageProcessor.process(
            input_data.image_bytes
        )

        prompt = PromptBuilder.build(
            input_data.description
        )

        raw_result = self._repository.diagnose(
            processed_image,
            prompt,
        )

        diagnostic = ResponseFormatter.format(
            raw_result
        )

        return DiagnosticResult(

            pathogen=diagnostic.pathogen,

            severity=diagnostic.severity,

            management=diagnostic.management,

            technical_warning=diagnostic.technical_warning,

        )