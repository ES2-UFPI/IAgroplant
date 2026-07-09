from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers

from shared.utils.repository_factory import get_reputation_repository
from domains.reputation.application.use_cases.get_reputation_summary_use_case import (
    GetReputationSummaryUseCase,
)


# ─── SERIALIZERS ──────────────────────────────────────────────────────────────

class ReputationEntrySerializer(serializers.Serializer):
    id = serializers.CharField()
    action_type = serializers.CharField()
    points = serializers.IntegerField()
    reason = serializers.CharField(allow_null=True, required=False)
    reference_id = serializers.CharField(allow_null=True, required=False)
    created_at = serializers.DateTimeField()


class ReputationSummarySerializer(serializers.Serializer):
    total = serializers.IntegerField()
    entries = ReputationEntrySerializer(many=True)


# ─── VIEWS ───────────────────────────────────────────────────────────────────

class MyReputationView(APIView):
    """
    GET /api/reputation/me - Consulta o total e o histórico de reputação do usuário autenticado.
    """

    def get(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        use_case = GetReputationSummaryUseCase(repository=get_reputation_repository())
        summary = use_case.execute(current_user.id)

        serializer = ReputationSummarySerializer(summary)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserReputationView(APIView):
    """
    GET /api/reputation/<user_id> - Consulta o total e o histórico de reputação de qualquer usuário.
    """

    def get(self, request, user_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        use_case = GetReputationSummaryUseCase(repository=get_reputation_repository())
        summary = use_case.execute(user_id)

        serializer = ReputationSummarySerializer(summary)
        return Response(serializer.data, status=status.HTTP_200_OK)
