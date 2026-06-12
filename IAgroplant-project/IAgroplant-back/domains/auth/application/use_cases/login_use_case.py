from dataclasses import dataclass

from domains.auth.domain.repositories.auth_repository import AuthRepository
from domains.auth.domain.services.token_service import TokenService


@dataclass
class LoginInput:
    email: str
    password: str


@dataclass
class LoginOutput:
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"


class LoginUseCase:

    def __init__(
        self,
        auth_repository: AuthRepository
    ):
        self._repo = auth_repository

    def execute(
        self,
        input_data: LoginInput
    ) -> LoginOutput:

        user = self._repo.find_by_email(
            input_data.email
        )

        if not user:
            raise ValueError(
                "Credenciais inválidas."
            )

        if not self._repo.validate_password(
            input_data.email,
            input_data.password
        ):
            raise ValueError(
                "Credenciais inválidas."
            )

        if not user.is_active:
            raise ValueError(
                "Usuário inativo."
            )

        access_token = TokenService.generate_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role,
        )

        refresh_token = TokenService.generate_refresh_token(
            user_id=user.id
        )

        return LoginOutput(
            access_token=access_token,
            refresh_token=refresh_token,
        )