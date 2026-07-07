from django.urls import path

from domains.notifications.presentation.controllers.notification_controller import (
    GetUserNotificationsView,
    MarkNotificationReadView,
    NotifyChatMessageView,
)

urlpatterns = [
    path(
        "notifications/",
        GetUserNotificationsView.as_view(),
        name="get_notifications",
    ),
    path(
        "notifications/<str:notification_id>/read/",
        MarkNotificationReadView.as_view(),
        name="mark_notification_read",
    ),
    path(
        "notifications/chat/",
        NotifyChatMessageView.as_view(),
        name="notify_chat_message",
    ),
]