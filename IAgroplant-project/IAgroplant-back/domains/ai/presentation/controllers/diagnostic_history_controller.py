from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers

from domains.ai.application.use_cases.get_diagnostic_by_id_use_case import (
    GetDiagnosticByIdUseCase,
)

from shared.utils.repository_factory import (
    get_diagnostic_record_repository,
    get_user_repository,
    get_reputation_repository,
)
from domains.ai.application.use_cases.list_user_diagnostics_use_case import ListUserDiagnosticsUseCase
from domains.ai.application.use_cases.list_pending_diagnostics_use_case import ListPendingDiagnosticsUseCase
from domains.ai.application.use_cases.confirm_diagnostic_use_case import (
    ConfirmDiagnosticUseCase,
    ConfirmDiagnosticInput,
)

from domains.ai.application.use_cases.delete_diagnostic_use_case import (
    DeleteDiagnosticUseCase,
    DeleteDiagnosticInput,
)

# ─── SERIALIZERS ──────────────────────────────────────────────────────────────

class DiagnosticRecordSerializer(serializers.Serializer):
    id = serializers.CharField()
    user_id = serializers.CharField()
    pathogen = serializers.CharField()
    severity = serializers.CharField()
    management = serializers.CharField()
    technical_warning = serializers.CharField()
    confirmed = serializers.BooleanField()
    confirmed_by = serializers.CharField(allow_null=True, required=False)
    confirmed_at = serializers.DateTimeField(allow_null=True, required=False)
    created_at = serializers.DateTimeField()


# ─── VIEWS ───────────────────────────────────────────────────────────────────

class MyDiagnosticsView(APIView):
    """
    GET /api/diagnostics/me - Histórico de diagnósticos do usuário autenticado.
    """

    def get(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        use_case = ListUserDiagnosticsUseCase(repository=get_diagnostic_record_repository())
        records = use_case.execute(current_user.id)
        return Response(DiagnosticRecordSerializer(records, many=True).data, status=status.HTTP_200_OK)


class PendingDiagnosticsView(APIView):
    """
    GET /api/diagnostics/pending - Diagnósticos de outros usuários aguardando confirmação
    (somente para profissionais certificados).
    """

    def get(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        if not current_user.certificado:
            return Response(
                {"detail": "Somente profissionais certificados podem ver diagnósticos pendentes."},
                status=status.HTTP_403_FORBIDDEN
            )

        use_case = ListPendingDiagnosticsUseCase(repository=get_diagnostic_record_repository())
        records = use_case.execute(exclude_user_id=current_user.id)

        user_repo = get_user_repository()
        data = []
        for record in records:
            item = DiagnosticRecordSerializer(record).data
            submitter = user_repo.get_by_id(record.user_id)
            item["user_name"] = submitter.name if submitter else "Usuário"
            data.append(item)

        return Response(data, status=status.HTTP_200_OK)


class ConfirmDiagnosticView(APIView):
    """
    POST /api/diagnostics/<record_id>/confirm - Confirma o diagnóstico de outro usuário.
    """

    def post(self, request, record_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        use_case = ConfirmDiagnosticUseCase(
            record_repository=get_diagnostic_record_repository(),
            reputation_repository=get_reputation_repository(),
        )

        try:
            record = use_case.execute(
                ConfirmDiagnosticInput(record_id=record_id, confirming_user=current_user)
            )
            return Response(DiagnosticRecordSerializer(record).data, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DiagnosticDetailView(APIView):
    """
    GET /api/diagnostics/<id>
    """

    def get(
        self,
        request,
        record_id,
    ):

        current_user = getattr(
            request,
            "current_user",
            None,
        )

        if not current_user:

            return Response(

                {
                    "detail": "Não autenticado."
                },

                status=status.HTTP_401_UNAUTHORIZED,

            )

        use_case = GetDiagnosticByIdUseCase(

            repository=get_diagnostic_record_repository()

        )

        try:

            record = use_case.execute(

                record_id,

                current_user.id,

            )

            return Response(

                DiagnosticRecordSerializer(record).data,

                status=status.HTTP_200_OK,

            )

        except ValueError as e:

            return Response(

                {
                    "detail": str(e)
                },

                status=status.HTTP_404_NOT_FOUND,

            )

class DeleteDiagnosticView(APIView):
    """
    DELETE /api/diagnostics/<id>
    """

    def delete(
        self,
        request,
        record_id,
    ):

        current_user = getattr(
            request,
            "current_user",
            None,
        )

        if not current_user:

            return Response(

                {
                    "detail": "Não autenticado."
                },

                status=status.HTTP_401_UNAUTHORIZED,

            )

        use_case = DeleteDiagnosticUseCase(

            repository=get_diagnostic_record_repository()

        )

        try:

            use_case.execute(

                DeleteDiagnosticInput(

                    record_id=record_id,

                    user_id=current_user.id,

                )

            )

            return Response(

                status=status.HTTP_204_NO_CONTENT,

            )

        except ValueError as e:

            return Response(

                {

                    "detail": str(e)

                },

                status=status.HTTP_404_NOT_FOUND,

            )