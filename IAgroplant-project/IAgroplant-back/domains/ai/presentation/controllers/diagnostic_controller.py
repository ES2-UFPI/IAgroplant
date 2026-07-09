from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status


from domains.ai.presentation.validators.diagnostic_validator import DiagnosticValidator
from domains.ai.application.facade.diagnostic_facade import DiagnosticFacade
from domains.ai.infrastructure.composition.ai_factory import AIFactory
from domains.ai.application.use_cases.save_diagnostic_record_use_case import (
    SaveDiagnosticRecordUseCase,
    SaveDiagnosticRecordInput,
)
from shared.utils.repository_factory import get_diagnostic_record_repository



class DiagnosticController(APIView):


    parser_classes = [
        MultiPartParser,
        FormParser,
    ]



    def post(self, request):

        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        validator = DiagnosticValidator(
            data=request.data
        )


        validator.is_valid(
            raise_exception=True
        )


        image_file = validator.validated_data["image"]


        print(
           "TIPO:",
           type(image_file)
        )


        print(
            "NOME:",
            image_file.name
        )


        print(
            "TAMANHO:",
           image_file.size
        )


        image_bytes = image_file.read()


        description = validator.validated_data.get(
            "description",
            ""
        )


        print(
            "DESCRICAO:",
            description
        )


        facade = DiagnosticFacade(
            repository=AIFactory.create()
        )


        result = facade.diagnose(
            image_bytes,
            description,
        )

        record = SaveDiagnosticRecordUseCase(repository=get_diagnostic_record_repository()).execute(
            SaveDiagnosticRecordInput(
                user_id=current_user.id,
                pathogen=result.pathogen,
                severity=result.severity,
                management=result.management,
                technical_warning=result.technical_warning,
            )
        )

        return Response(

            {
                "pathogen": result.pathogen,

                "severity": result.severity,

                "management": result.management,

                "technical_warning": result.technical_warning,
                "diagnostic_id": record.id,
            },

            status=status.HTTP_200_OK

        )