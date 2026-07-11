import io

from PIL import Image

from domains.ai.application.dto.diagnostic_input import DiagnosticInput
from domains.ai.application.use_cases.diagnose_use_case import DiagnoseUseCase
from domains.ai.infrastructure.clients.fake_ai_client import FakeAIClient


def create_fake_image():

    image = Image.new(
        "RGB",
        (100, 100),
        color="green"
    )

    buffer = io.BytesIO()

    image.save(
        buffer,
        format="JPEG"
    )

    return buffer.getvalue()


def test_should_return_valid_diagnostic():

    repository = FakeAIClient()

    use_case = DiagnoseUseCase(repository)

    result = use_case.execute(

        DiagnosticInput(

            image_bytes=create_fake_image(),

            description="Folha com manchas"

        )

    )

    assert result.pathogen != ""

    assert result.severity != ""

    assert result.management != ""

    assert result.technical_warning != ""