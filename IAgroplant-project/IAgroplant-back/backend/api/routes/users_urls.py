from django.urls import path
from domains.users.presentation.controllers.users_controller import (
    MeProfileView,
    MeProfilePhotoView,
    MeInitialGuidanceView,
    MeInteractiveOnboardingView,
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
        "users/me/onboarding",
        MeInitialGuidanceView.as_view(),
        name="users-me-onboarding"
    ),
    path(
        "users/me/coach-marks",
        MeInteractiveOnboardingView.as_view(),
        name="users-me-coach-marks"
    ),
    path(
        "specialists/search",
        SpecialistSearchView.as_view(),
        name="specialists-search"
    ),
]
