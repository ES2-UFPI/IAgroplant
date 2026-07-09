from django.urls import path
from domains.auth.presentation.controllers.auth_controller import LoginView, RefreshTokenView

urlpatterns = [
    path("login", LoginView.as_view(), name="auth-login"),
    path("refresh", RefreshTokenView.as_view(), name="auth-refresh"),
]