from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from domains.notifications.application.use_cases.get_user_notifications_use_case import (
    GetUserNotificationsUseCase,
    GetUserNotificationsInput,
)
from domains.notifications.application.use_cases.mark_notification_read_use_case import (
    MarkNotificationReadUseCase,
    MarkNotificationReadInput,
)
from domains.notifications.application.use_cases.notify_chat_message_use_case import (
    NotifyChatMessageUseCase,
    NotifyChatMessageInput,
)
from shared.utils.repository_factory import get_notification_repository



class GetUserNotificationsView(APIView):
    """
    GET /api/notifications/
    """

    def get(self, request):
        try:
            repo = get_notification_repository()
            use_case = GetUserNotificationsUseCase(notification_repository=repo)
            result = use_case.execute(
                GetUserNotificationsInput(
                    user_id=request.current_user.id
                )
            )
            notifications = [
                {
                    "id": n.id,
                    "title": n.title,
                    "body": n.body,
                    "type": n.type,
                    "is_read": n.is_read,
                    "created_at": n.created_at.isoformat(),
                    "metadata": n.metadata,
                }
                for n in result.notifications
            ]
            return Response(notifications, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"detail": "Erro interno no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MarkNotificationReadView(APIView):
    """
    PATCH /api/notifications/<id>/read/
    """

    def patch(self, request, notification_id):
        try:
            repo = get_notification_repository()
            use_case = MarkNotificationReadUseCase(notification_repository=repo)
            result = use_case.execute(
                MarkNotificationReadInput(
                    notification_id=notification_id
                )
            )
            return Response(
                {"success": result.success},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"detail": "Erro interno no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class NotifyChatMessageView(APIView):
    """
    POST /api/notifications/chat/
    """

    def post(self, request):
        try:
            repo = get_notification_repository()
            use_case = NotifyChatMessageUseCase(notification_repository=repo)
            result = use_case.execute(
                NotifyChatMessageInput(
                    user_id=request.current_user.id,
                    sender_name=request.data.get("sender_name"),
                    message_preview=request.data.get("message_preview"),
                    chat_id=request.data.get("chat_id"),
                )
            )
            return Response(
                {
                    "notification_id": result.notification_id,
                    "title": result.title,
                    "body": result.body,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception:
            return Response(
                {"detail": "Erro interno no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )