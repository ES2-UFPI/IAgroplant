from django.urls import path
from domains.connections.presentation.controllers.connections_controller import (
    ConnectionsView,
    PendingConnectionsView,
    SentConnectionsView,
    AcceptConnectionView,
    RejectConnectionView,
)

urlpatterns = [
    path(
        "connections",
        ConnectionsView.as_view(),
        name="connections-create"
    ),
    path(
        "connections/pending",
        PendingConnectionsView.as_view(),
        name="connections-pending"
    ),
    path(
        "connections/sent",
        SentConnectionsView.as_view(),
        name="connections-sent"
    ),
    path(
        "connections/<str:connection_id>/accept",
        AcceptConnectionView.as_view(),
        name="connections-accept"
    ),
    path(
        "connections/<str:connection_id>/reject",
        RejectConnectionView.as_view(),
        name="connections-reject"
    ),
]
