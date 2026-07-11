from django.urls import path
from domains.users.presentation.controllers.users_controller import (
    MeProfileView,
    MeProfilePhotoView,
    SpecialistSearchView,
)

urlpatterns = [
    path(
        "users/me",
        MeProfileView.as_view(),
        name="users-me"
    ),
    path(
        "users/me/photo",
        MeProfilePhotoView.as_view(),
        name="users-me-photo"
    ),
    path(
        "specialists/search",
        SpecialistSearchView.as_view(),
        name="specialists-search"
    ),
]