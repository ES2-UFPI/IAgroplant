import pytest
from unittest.mock import MagicMock
from domains.auth.domain.entities.user import User
from domains.auth.application.use_cases.login_use_case import LoginUseCase, LoginInput
from domains.auth.application.use_cases.refresh_token_use_case import RefreshTokenUseCase, RefreshTokenInput
from domains.auth.domain.services.token_service import TokenService


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_user():
    return User(
        id="user-123",
        email="teste@iagroplant.com",
        name="Agricultor Teste",
        role="user",
        is_active=True,
    )


@pytest.fixture
def mock_repo(mock_user):
    repo = MagicMock()
    repo.find_by_email.return_value = mock_user
    repo.find_by_id.return_value = mock_user
    return repo


# ─── LoginUseCase ─────────────────────────────────────────────────────────────

class TestLoginUseCase:

    def test_login_sucesso(self, mock_repo):
        use_case = LoginUseCase(auth_repository=mock_repo)
        result = use_case.execute(LoginInput(email="teste@iagroplant.com", password="senha123"))

        assert result.access_token is not None
        assert result.refresh_token is not None
        assert result.token_type == "Bearer"

    def test_login_usuario_nao_encontrado(self, mock_repo):
        mock_repo.find_by_email.return_value = None
        use_case = LoginUseCase(auth_repository=mock_repo)

        with pytest.raises(ValueError, match="Credenciais inválidas."):
            use_case.execute(LoginInput(email="naoexiste@teste.com", password="senha123"))

    def test_login_usuario_inativo(self, mock_repo, mock_user):
        mock_user.is_active = False
        use_case = LoginUseCase(auth_repository=mock_repo)

        with pytest.raises(ValueError, match="Usuário inativo."):
            use_case.execute(LoginInput(email="teste@iagroplant.com", password="senha123"))


# ─── RefreshTokenUseCase ──────────────────────────────────────────────────────

class TestRefreshTokenUseCase:

    def test_refresh_sucesso(self, mock_repo, mock_user):
        refresh_token = TokenService.generate_refresh_token(user_id=mock_user.id)
        use_case = RefreshTokenUseCase(auth_repository=mock_repo)
        result = use_case.execute(RefreshTokenInput(refresh_token=refresh_token))

        assert result.access_token is not None
        assert result.token_type == "Bearer"

    def test_refresh_com_access_token_invalido(self, mock_repo, mock_user):
        # Passa um access_token no lugar do refresh_token — deve falhar
        access_token = TokenService.generate_access_token(
            user_id=mock_user.id,
            email=mock_user.email,
            role=mock_user.role,
        )
        use_case = RefreshTokenUseCase(auth_repository=mock_repo)

        with pytest.raises(ValueError, match="Token inválido para refresh."):
            use_case.execute(RefreshTokenInput(refresh_token=access_token))

    def test_refresh_token_invalido(self, mock_repo):
        use_case = RefreshTokenUseCase(auth_repository=mock_repo)

        with pytest.raises(ValueError):
            use_case.execute(RefreshTokenInput(refresh_token="token-invalido"))
