import pytest
from unittest.mock import MagicMock
from domains.auth.domain.entities.user import User
from domains.users.application.use_cases.get_profile_use_case import GetProfileUseCase
from domains.users.application.use_cases.update_profile_use_case import UpdateProfileUseCase, UpdateProfileInput
from domains.users.application.use_cases.update_profile_photo_use_case import UpdateProfilePhotoUseCase


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_repo():
    return MagicMock()


@pytest.fixture
def mock_storage():
    return MagicMock()


@pytest.fixture
def existing_user():
    return User(
        id="1",
        email="admin@teste.com",
        name="Administrador",
        role="admin",
        region="Distrito Federal",
        certificado=True,
        especialidades=["Manejo de Pragas", "Solo"],
        photo_url=None,
    )


# ─── GetProfileUseCase Tests ─────────────────────────────────────────────────

class TestGetProfileUseCase:

    def test_returns_profile_from_repository_when_found(self, mock_repo, existing_user):
        mock_repo.get_by_id.return_value = existing_user

        use_case = GetProfileUseCase(repository=mock_repo)
        result = use_case.execute(existing_user)

        assert result is existing_user
        mock_repo.get_by_id.assert_called_once_with("1")

    def test_falls_back_to_current_user_when_not_found(self, mock_repo, existing_user):
        mock_repo.get_by_id.return_value = None

        use_case = GetProfileUseCase(repository=mock_repo)
        result = use_case.execute(existing_user)

        assert result is existing_user


# ─── UpdateProfileUseCase Tests ──────────────────────────────────────────────

class TestUpdateProfileUseCase:

    def test_updates_only_provided_fields(self, mock_repo, existing_user):
        mock_repo.get_by_id.return_value = existing_user
        mock_repo.update.side_effect = lambda u: u

        use_case = UpdateProfileUseCase(repository=mock_repo)
        result = use_case.execute(
            existing_user,
            UpdateProfileInput(region="Bahia", especialidades=["Solo", "Irrigação"]),
        )

        assert result.region == "Bahia"
        assert result.especialidades == ["Solo", "Irrigação"]
        # Campos não enviados permanecem intactos
        assert result.name == "Administrador"
        mock_repo.update.assert_called_once()

    def test_none_fields_do_not_overwrite_existing_values(self, mock_repo, existing_user):
        mock_repo.get_by_id.return_value = existing_user
        mock_repo.update.side_effect = lambda u: u

        use_case = UpdateProfileUseCase(repository=mock_repo)
        result = use_case.execute(existing_user, UpdateProfileInput())

        assert result.name == existing_user.name
        assert result.region == existing_user.region
        assert result.especialidades == existing_user.especialidades

    def test_email_and_certificado_are_never_changed(self, mock_repo, existing_user):
        mock_repo.get_by_id.return_value = existing_user
        mock_repo.update.side_effect = lambda u: u

        # UpdateProfileInput não tem campos email/certificado, então nem é
        # possível repassá-los — a garantia é estrutural, não em runtime.
        use_case = UpdateProfileUseCase(repository=mock_repo)
        result = use_case.execute(existing_user, UpdateProfileInput(name="Novo Nome"))

        assert result.email == "admin@teste.com"
        assert result.certificado is True


# ─── UpdateProfilePhotoUseCase Tests ─────────────────────────────────────────

class TestUpdateProfilePhotoUseCase:

    def test_uploads_and_persists_photo_url(self, mock_repo, mock_storage, existing_user):
        mock_repo.get_by_id.return_value = existing_user
        mock_repo.update.side_effect = lambda u: u
        mock_storage.upload_image.return_value = "https://res.cloudinary.com/demo/image/upload/user-1.jpg"

        use_case = UpdateProfilePhotoUseCase(repository=mock_repo, storage_service=mock_storage)
        fake_file = object()
        result = use_case.execute(existing_user, fake_file)

        mock_storage.upload_image.assert_called_once_with(fake_file, public_id="user-1")
        assert result.photo_url == "https://res.cloudinary.com/demo/image/upload/user-1.jpg"
