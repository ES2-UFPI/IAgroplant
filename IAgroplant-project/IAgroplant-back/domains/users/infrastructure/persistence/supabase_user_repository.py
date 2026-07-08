from typing import List, Optional
from supabase import Client
from domains.auth.domain.entities.user import User
from domains.users.domain.repositories.user_repository import UserRepository
from integrations.database.supabase_client import get_supabase_client


class SupabaseUserRepository(UserRepository):

    def __init__(self, client: Optional[Client] = None):
        self._client = client or get_supabase_client()

    def get_by_id(self, user_id: str) -> Optional[User]:
        if not self._client:
            return None
        try:
            response = (
                self._client.table("users")
                .select("*")
                .eq("id", user_id)
                .single()
                .execute()
            )
            if not response.data:
                return None
            
            return self._map_to_entity(response.data)
        except Exception:
            return None

    def update(self, user: User) -> User:
        if not self._client:
            return user
        
        data = self._map_to_dict(user)
        try:
            self._client.table("users").upsert(data).execute()
        except Exception:
            pass
        return user

    def find_by_role_and_region(self, role: str, region: str) -> List[User]:
        if not self._client:
            return []
        try:
            response = (
                self._client.table("users")
                .select("*")
                .eq("role", role)
                .eq("region", region)
                .execute()
            )
            if not response.data:
                return []
            return [self._map_to_entity(item) for item in response.data]
        except Exception:
            return []

    def _map_to_entity(self, data: dict) -> User:
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

    def _map_to_dict(self, user: User) -> dict:
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_active": user.is_active,
            "password_hash": user.password_hash,
            "region": user.region,
            "certificado": user.certificado,
            "especialidades": user.especialidades,
            "photo_url": user.photo_url,
        }
