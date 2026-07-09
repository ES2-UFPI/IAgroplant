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
                region="Distrito Federal",
                certificado=True,
                especialidades=["Manejo de Pragas", "Solo"],
            )

        if email == "estudante@teste.com":

            return User(
                id="estudante-1",
                email="estudante@teste.com",
                name="Estudante Piauí",
                role="estudante",
                is_active=True,
                region="Piauí",
                certificado=False,
                especialidades=["Culturas Anuais"],
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
                region="Distrito Federal",
                certificado=True,
                especialidades=["Manejo de Pragas", "Solo"],
            )

        if user_id == "estudante-1":

            return User(
                id="estudante-1",
                email="estudante@teste.com",
                name="Estudante Piauí",
                role="estudante",
                is_active=True,
                region="Piauí",
                certificado=False,
                especialidades=["Culturas Anuais"],
            )

        return None

    def validate_password(
        self,
        email: str,
        password: str,
    ) -> bool:

        if email == "admin@teste.com":
            return password == "123456"

        if email == "estudante@teste.com":
            return password == "123456"

        return False