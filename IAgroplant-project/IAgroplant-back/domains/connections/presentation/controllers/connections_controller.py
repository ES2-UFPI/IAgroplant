from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers

from shared.utils.repository_factory import (
    get_connection_repository,
    get_user_repository,
    get_reputation_repository,
)
from domains.connections.application.use_cases.send_connection_request_use_case import (
    SendConnectionRequestUseCase,
    SendConnectionRequestInput,
)
from domains.connections.application.use_cases.accept_connection_request_use_case import (
    AcceptConnectionRequestUseCase,
    AcceptConnectionRequestInput,
)
from domains.connections.application.use_cases.reject_connection_request_use_case import (
    RejectConnectionRequestUseCase,
    RejectConnectionRequestInput,
)
from domains.connections.application.use_cases.list_pending_connections_use_case import (
    ListPendingConnectionsUseCase,
)
from domains.connections.application.use_cases.list_sent_connections_use_case import (
    ListSentConnectionsUseCase,
)


# ─── SERIALIZERS ──────────────────────────────────────────────────────────────

class ConnectionRequestSerializer(serializers.Serializer):
    id = serializers.CharField()
    from_user_id = serializers.CharField()
    from_user_name = serializers.CharField()
    to_user_id = serializers.CharField()
    to_user_name = serializers.CharField()
    status = serializers.CharField()
    created_at = serializers.DateTimeField()
    responded_at = serializers.DateTimeField(allow_null=True, required=False)


# ─── VIEWS ───────────────────────────────────────────────────────────────────

class ConnectionsView(APIView):
    """
    POST /api/connections - Envia uma solicitação de conexão
    """

    def post(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        to_user_id = request.data.get("to_user_id")
        if not to_user_id:
            return Response({"detail": "'to_user_id' é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

        use_case = SendConnectionRequestUseCase(
            connection_repository=get_connection_repository(),
            user_repository=get_user_repository(),
        )

        try:
            connection = use_case.execute(
                SendConnectionRequestInput(from_user=current_user, to_user_id=to_user_id)
            )
            return Response(
                ConnectionRequestSerializer(connection).data,
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PendingConnectionsView(APIView):
    """
    GET /api/connections/pending - Lista solicitações pendentes recebidas
    """

    def get(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        use_case = ListPendingConnectionsUseCase(repository=get_connection_repository())
        connections = use_case.execute(current_user.id)
        return Response(
            ConnectionRequestSerializer(connections, many=True).data,
            status=status.HTTP_200_OK
        )


class SentConnectionsView(APIView):
    """
    GET /api/connections/sent - Lista solicitações enviadas pelo usuário
    """

    def get(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        use_case = ListSentConnectionsUseCase(repository=get_connection_repository())
        connections = use_case.execute(current_user.id)
        return Response(
            ConnectionRequestSerializer(connections, many=True).data,
            status=status.HTTP_200_OK
        )


class AcceptConnectionView(APIView):
    """
    POST /api/connections/<connection_id>/accept - Aceita uma solicitação de conexão
    """

    def post(self, request, connection_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        use_case = AcceptConnectionRequestUseCase(
            connection_repository=get_connection_repository(),
            reputation_repository=get_reputation_repository(),
        )

        try:
            connection = use_case.execute(
                AcceptConnectionRequestInput(connection_id=connection_id, acting_user=current_user)
            )
            return Response(ConnectionRequestSerializer(connection).data, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RejectConnectionView(APIView):
    """
    POST /api/connections/<connection_id>/reject - Rejeita uma solicitação de conexão
    """

    def post(self, request, connection_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        use_case = RejectConnectionRequestUseCase(connection_repository=get_connection_repository())

        try:
            connection = use_case.execute(
                RejectConnectionRequestInput(connection_id=connection_id, acting_user=current_user)
            )
            return Response(ConnectionRequestSerializer(connection).data, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
