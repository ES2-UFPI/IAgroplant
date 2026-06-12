from domains.auth.domain.entities.user import User
from domains.auth.domain.repositories.auth_repository import AuthRepository


class PostgresAuthRepository(AuthRepository):

    def find_by_email(self, email: str):

        if email == "admin@teste.com":

            return User(
                id="1",
                email="admin@teste.com",
                name="Administrador",
                role="admin",
                is_active=True,
            )

        return None

    def find_by_id(self, user_id: str):

        if user_id == "1":

            return User(
                id="1",
                email="admin@teste.com",
                name="Administrador",
                role="admin",
                is_active=True,
            )

        return None

    def validate_password(
        self,
        email: str,
        password: str,
    ) -> bool:

        return (
            email == "admin@teste.com"
            and password == "123456"
        )