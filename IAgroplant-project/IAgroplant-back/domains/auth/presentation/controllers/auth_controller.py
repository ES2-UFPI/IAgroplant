from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from domains.auth.application.use_cases.login_use_case import LoginUseCase, LoginInput
from domains.auth.application.use_cases.refresh_token_use_case import RefreshTokenUseCase, RefreshTokenInput
from shared.utils.repository_factory import get_auth_repository
from domains.auth.presentation.validators.auth_validator import LoginValidator, RefreshValidator


class LoginView(APIView):
    """
    POST /auth/login
    Body: { "email": "...", "password": "..." }
    """

    def post(self, request):
        validator = LoginValidator(data=request.data)
        if not validator.is_valid():
            return Response(validator.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            repo = get_auth_repository()
            use_case = LoginUseCase(auth_repository=repo)
            result = use_case.execute(
                LoginInput(
                    email=validator.validated_data["email"],
                    password=validator.validated_data["password"],
                )
            )
            return Response(
                {
                    "access_token": result.access_token,
                    "refresh_token": result.refresh_token,
                    "token_type": result.token_type,
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return Response(
                {"detail": "Erro interno no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RefreshTokenView(APIView):
    """
    POST /auth/refresh
    Body: { "refresh_token": "..." }
    """

    def post(self, request):
        validator = RefreshValidator(data=request.data)
        if not validator.is_valid():
            return Response(validator.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            repo = get_auth_repository()
            use_case = RefreshTokenUseCase(auth_repository=repo)
            result = use_case.execute(
                RefreshTokenInput(
                    refresh_token=validator.validated_data["refresh_token"]
                )
            )
            return Response(
                {
                    "access_token": result.access_token,
                    "token_type": result.token_type,
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return Response(
                {"detail": "Erro interno no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
