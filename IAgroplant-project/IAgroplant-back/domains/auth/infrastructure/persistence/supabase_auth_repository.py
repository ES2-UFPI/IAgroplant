from typing import Optional
import bcrypt
from supabase import create_client, Client
from decouple import config

from domains.auth.domain.entities.user import User
from domains.auth.domain.repositories.auth_repository import AuthRepository


class SupabaseAuthRepository(AuthRepository):

    def __init__(self, client: Optional[Client] = None):
        if client is not None:
            self._client = client
        else:
            url: str = config("SUPABASE_URL")
            key: str = config("SUPABASE_SERVICE_ROLE_KEY")
            self._client = create_client(url, key)


    def find_by_email(self, email: str) -> Optional[User]:
        response = (
            self._client.table("users")
            .select("*")
            .eq("email", email)
            .single()
            .execute()
        )

        if not response.data:
            return None

        data = response.data
        return User(
            id=data["id"],
            email=data["email"],
            name=data.get("name", ""),
            role=data.get("role", "user"),
            is_active=data.get("is_active", True),
            password_hash=data.get("password_hash"),
            region=data.get("region"),
            certificado=data.get("certificado", False),
            especialidades=data.get("especialidades") or [],
            photo_url=data.get("photo_url"),
        )

    def find_by_id(self, user_id: str) -> Optional[User]:
        response = (
            self._client.table("users")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not response.data:
            return None

        data = response.data
        return User(
            id=data["id"],
            email=data["email"],
            name=data.get("name", ""),
            role=data.get("role", "user"),
            is_active=data.get("is_active", True),
            password_hash=data.get("password_hash"),
            region=data.get("region"),
            certificado=data.get("certificado", False),
            especialidades=data.get("especialidades") or [],
            photo_url=data.get("photo_url"),
        )

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
