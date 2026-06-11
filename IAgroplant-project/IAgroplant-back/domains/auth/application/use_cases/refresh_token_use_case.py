from dataclasses import dataclass
from domains.auth.domain.repositories.auth_repository import AuthRepository
from domains.auth.domain.services.token_service import TokenService


@dataclass
class RefreshTokenInput:
    refresh_token: str


@dataclass
class RefreshTokenOutput:
    access_token: str
    token_type: str = "Bearer"


class RefreshTokenUseCase:

    def __init__(self, auth_repository: AuthRepository):
        self._repo = auth_repository

    def execute(self, input_data: RefreshTokenInput) -> RefreshTokenOutput:
        try:
            payload = TokenService.decode_token(input_data.refresh_token)
        except ValueError as e:
            raise ValueError(str(e))

        if not TokenService.is_refresh_token(payload):
            raise ValueError("Token inválido para refresh.")

        user_id = payload.get("sub")
        user = self._repo.find_by_id(user_id)

        if not user or not user.is_active:
            raise ValueError("Usuário não encontrado ou inativo.")

        new_access_token = TokenService.generate_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role,
        )

        return RefreshTokenOutput(access_token=new_access_token)
