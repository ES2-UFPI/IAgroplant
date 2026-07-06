from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework import status

from domains.ai.presentation.validators.diagnostic_validator import DiagnosticValidator

from domains.ai.application.facade.diagnostic_facade import DiagnosticFacade

from domains.ai.infrastructure.composition.ai_factory import AIFactory


class DiagnosticController(APIView):

    def post(self, request):

        validator = DiagnosticValidator(
            data=request.data
        )

        if not validator.is_valid():

            return Response(
                validator.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        image = validator.validated_data["image"]

        description = validator.validated_data.get(
            "description",
            "",
        )

        facade = DiagnosticFacade(

            repository=AIFactory.create()

        )

        result = facade.diagnose(

            image.read(),

            description,

        )

        return Response(

            {

                "pathogen":

                    result.pathogen,

                "severity":

                    result.severity,

                "management":

                    result.management,

                "technical_warning":

                    result.technical_warning,

            }

        )