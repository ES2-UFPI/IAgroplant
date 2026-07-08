from domains.auth.domain.entities.user import User
from domains.users.domain.repositories.user_repository import UserRepository


class GetProfileUseCase:

    def __init__(self, repository: UserRepository):
        self._repo = repository

    def execute(self, current_user: User) -> User:
        # Fallback gracioso: se o perfil ainda não foi persistido no repositório
        # de users, devolve os dados já conhecidos de quem autenticou.
        return self._repo.get_by_id(current_user.id) or current_user
