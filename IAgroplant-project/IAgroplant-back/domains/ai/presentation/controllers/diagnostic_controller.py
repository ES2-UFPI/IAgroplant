from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from domains.ai.presentation.validators.diagnostic_validator import DiagnosticValidator
from domains.ai.application.facade.diagnostic_facade import DiagnosticFacade
from domains.ai.infrastructure.composition.ai_factory import AIFactory


class DiagnosticController(APIView):

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]


    def post(self, request):

        validator = DiagnosticValidator(
            data=request.data
        )


        validator.is_valid(
            raise_exception=True
        )


        image = validator.validated_data["image"]


        description = validator.validated_data.get(
            "description",
            ""
        )


        image_bytes = image.read()


        facade = DiagnosticFacade(
            repository=AIFactory.create()
        )


        result = facade.diagnose(
            image_bytes,
            description,
        )


        return Response(
            {
                "pathogen": result.pathogen,
                "severity": result.severity,
                "management": result.management,
                "technical_warning": result.technical_warning,
            },
            status=status.HTTP_200_OK,
        )