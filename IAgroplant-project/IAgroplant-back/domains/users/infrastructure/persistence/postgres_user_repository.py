from typing import List, Optional
from domains.auth.domain.entities.user import User
from domains.users.domain.repositories.user_repository import UserRepository


class PostgresUserRepository(UserRepository):
    # In-memory storage to serve as a mock/stub that simulates a database table.
    _users: List[User] = []
    _initialized = False

    def __init__(self):
        if not PostgresUserRepository._initialized:
            self._prepopulate_mock_data()
            PostgresUserRepository._initialized = True

    def _prepopulate_mock_data(self):
        # Mesmo id="1" usado por PostgresAuthRepository, para consistência de demo.
        PostgresUserRepository._users.append(
            User(
                id="1",
                email="admin@teste.com",
                name="Administrador",
                role="admin",
                is_active=True,
                region="Distrito Federal",
                certificado=True,
                especialidades=["Manejo de Pragas", "Solo"],
            )
        )
        # Mock student for proximity notification testing
        PostgresUserRepository._users.append(
            User(
                id="estudante-1",
                email="estudante@teste.com",
                name="Estudante Piauí",
                role="estudante",
                is_active=True,
                region="Piauí",
                certificado=False,
                especialidades=["Culturas Anuais"],
            )
        )

    def get_by_id(self, user_id: str) -> Optional[User]:
        for u in PostgresUserRepository._users:
            if u.id == user_id:
                return u
        return None

    def update(self, user: User) -> User:
        for idx, u in enumerate(PostgresUserRepository._users):
            if u.id == user.id:
                PostgresUserRepository._users[idx] = user
                return user
        PostgresUserRepository._users.append(user)
        return user

    def find_by_role_and_region(self, role: str, region: str) -> List[User]:
        return [
            u for u in PostgresUserRepository._users
            if u.role.lower() == role.lower() and (u.region or "").lower() == region.lower()
        ]

