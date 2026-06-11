from django.urls import path
from domains.auth.presentation.controllers.auth_controller import LoginView, RefreshTokenView

urlpatterns = [
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/refresh", RefreshTokenView.as_view(), name="auth-refresh"),
]