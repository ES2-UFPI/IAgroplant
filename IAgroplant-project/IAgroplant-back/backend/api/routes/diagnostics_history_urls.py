from django.urls import path
from domains.ai.presentation.controllers.diagnostic_history_controller import (
    MyDiagnosticsView,
    PendingDiagnosticsView,
    ConfirmDiagnosticView,
)

urlpatterns = [
    path(
        "diagnostics/me",
        MyDiagnosticsView.as_view(),
        name="diagnostics-me"
    ),
    path(
        "diagnostics/pending",
        PendingDiagnosticsView.as_view(),
        name="diagnostics-pending"
    ),
    path(
        "diagnostics/<str:record_id>/confirm",
        ConfirmDiagnosticView.as_view(),
        name="diagnostics-confirm"
    ),
]
