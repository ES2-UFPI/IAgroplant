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
from domains.notifications.application.use_cases.get_notification_preferences_use_case import (
    GetNotificationPreferencesUseCase,
    GetNotificationPreferencesInput,
)
from domains.notifications.application.use_cases.update_notification_preferences_use_case import (
    UpdateNotificationPreferencesUseCase,
    UpdateNotificationPreferencesInput,
)
from domains.notifications.domain.entities.notification import NotificationPreference
from domains.notifications.infrastructure.persistence.postgres_notification_repository import (
    PostgresNotificationRepository,
)


class GetUserNotificationsView(APIView):
    """
    GET /api/notifications/
    """

    def get(self, request):
        try:
            repo = PostgresNotificationRepository()
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
            repo = PostgresNotificationRepository()
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


class GetNotificationPreferencesView(APIView):
    """
    GET /api/notifications/preferences/
    """

    def get(self, request):
        try:
            repo = PostgresNotificationRepository()
            use_case = GetNotificationPreferencesUseCase(notification_repository=repo)
            result = use_case.execute(
                GetNotificationPreferencesInput(
                    user_id=request.current_user.id
                )
            )
            preferences = [
                {
                    "type": p.type,
                    "enabled": p.enabled,
                }
                for p in result.preferences
            ]
            return Response(preferences, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"detail": "Erro interno no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateNotificationPreferencesView(APIView):
    """
    PUT /api/notifications/preferences/
    """

    def put(self, request):
        try:
            repo = PostgresNotificationRepository()
            use_case = UpdateNotificationPreferencesUseCase(notification_repository=repo)
            preferences = [
                NotificationPreference(
                    user_id=request.current_user.id,
                    type=p.get("type"),
                    enabled=p.get("enabled", True),
                )
                for p in request.data.get("preferences", [])
            ]
            result = use_case.execute(
                UpdateNotificationPreferencesInput(
                    user_id=request.current_user.id,
                    preferences=preferences,
                )
            )
            updated = [
                {
                    "type": p.type,
                    "enabled": p.enabled,
                }
                for p in result.preferences
            ]
            return Response(updated, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"detail": "Erro interno no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        