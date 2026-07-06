from dataclasses import replace
from domains.auth.domain.entities.user import User
from domains.users.domain.repositories.user_repository import UserRepository


class UpdateProfilePhotoUseCase:

    def __init__(self, repository: UserRepository, storage_service):
        self._repo = repository
        self._storage = storage_service

    def execute(self, current_user: User, file) -> User:
        existing = self._repo.get_by_id(current_user.id) or current_user
        photo_url = self._storage.upload_image(file, public_id=f"user-{existing.id}")
        updated = replace(existing, photo_url=photo_url)
        return self._repo.update(updated)
