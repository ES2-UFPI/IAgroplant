from django.urls import path

from domains.notifications.presentation.controllers.notification_controller import (
    GetUserNotificationsView,
    MarkNotificationReadView,
    GetNotificationPreferencesView,
    UpdateNotificationPreferencesView,
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
        "notifications/preferences/",
        GetNotificationPreferencesView.as_view(),
        name="get_notification_preferences",
    ),
    path(
        "notifications/preferences/update/",
        UpdateNotificationPreferencesView.as_view(),
        name="update_notification_preferences",
    ),
]