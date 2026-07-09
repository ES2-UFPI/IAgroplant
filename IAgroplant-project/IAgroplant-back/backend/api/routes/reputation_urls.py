from django.urls import path
from domains.reputation.presentation.controllers.reputation_controller import (
    MyReputationView,
    UserReputationView,
)

urlpatterns = [
    path(
        "reputation/me",
        MyReputationView.as_view(),
        name="reputation-me"
    ),
    path(
        "reputation/<str:user_id>",
        UserReputationView.as_view(),
        name="reputation-by-user"
    ),
]
