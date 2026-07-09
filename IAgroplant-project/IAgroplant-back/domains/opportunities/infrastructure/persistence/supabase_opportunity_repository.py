from datetime import datetime, timezone
from typing import List, Optional
from supabase import Client
from domains.opportunities.domain.entities.vacancy import Vacancy
from domains.opportunities.domain.entities.application import Application
from domains.opportunities.domain.repositories.opportunity_repository import OpportunityRepository
from integrations.database.supabase_client import get_supabase_client


class SupabaseOpportunityRepository(OpportunityRepository):

    def __init__(self, client: Optional[Client] = None):
        self._client = client or get_supabase_client()

    def save_opportunity(self, vacancy: Vacancy) -> Vacancy:
        if not self._client:
            return vacancy
        data = self._map_vacancy_to_dict(vacancy)
        try:
            self._client.table("opportunities").upsert(data).execute()
        except Exception:
            pass
        return vacancy

    def get_opportunity_by_id(self, opportunity_id: str) -> Optional[Vacancy]:
        if not self._client:
            return None
        try:
            response = (
                self._client.table("opportunities")
                .select("*")
                .eq("id", opportunity_id)
                .single()
                .execute()
            )
            if not response.data:
                return None
            return self._map_dict_to_vacancy(response.data)
        except Exception:
            return None

    def list_opportunities(
        self,
        region: Optional[str] = None,
        culture: Optional[str] = None,
        vacancy_type: Optional[str] = None,
    ) -> List[Vacancy]:
        if not self._client:
            return []
        try:
            query = self._client.table("opportunities").select("*")
            if region:
                query = query.ilike("region", f"%{region}%")
            if culture:
                query = query.ilike("culture", f"%{culture}%")
            if vacancy_type:
                query = query.eq("vacancy_type", vacancy_type)
            
            response = query.execute()
            if not response.data:
                return []
            return [self._map_dict_to_vacancy(item) for item in response.data]
        except Exception as e:
            import traceback
            traceback.print_exc()
            return []

    def save_application(self, application: Application) -> Application:
        if not self._client:
            return application
        data = self._map_application_to_dict(application)
        try:
            self._client.table("applications").upsert(data).execute()
        except Exception:
            pass
        return application

    def get_applications_by_user(self, user_id: str) -> List[Application]:
        if not self._client:
            return []
        try:
            response = (
                self._client.table("applications")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            if not response.data:
                return []
            return [self._map_dict_to_application(item) for item in response.data]
        except Exception:
            return []

    def get_applications_by_opportunity(self, opportunity_id: str) -> List[Application]:
        if not self._client:
            return []
        try:
            response = (
                self._client.table("applications")
                .select("*")
                .eq("opportunity_id", opportunity_id)
                .execute()
            )
            if not response.data:
                return []
            return [self._map_dict_to_application(item) for item in response.data]
        except Exception:
            return []

    def _parse_timestamp(self, ts_str: str) -> datetime:
        if not ts_str:
            return datetime.now(timezone.utc)
        # Handle 'Z' or offset formats
        ts_str = ts_str.replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(ts_str)
        except ValueError:
            # Fallback if format is slightly off
            try:
                return datetime.strptime(ts_str[:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
            except ValueError:
                return datetime.now(timezone.utc)

    def _map_vacancy_to_dict(self, v: Vacancy) -> dict:
        return {
            "id": v.id,
            "title": v.title,
            "description": v.description,
            "region": v.region,
            "culture": v.culture,
            "vacancy_type": v.vacancy_type,
            "salary": v.salary,
            "duration": v.duration,
            "producer_id": v.producer_id,
            "producer_name": v.producer_name,
            "expires_at": v.expires_at.isoformat(),
            "created_at": v.created_at.isoformat(),
        }

    def _map_dict_to_vacancy(self, data: dict) -> Vacancy:
        return Vacancy(
            id=data["id"],
            title=data["title"],
            description=data["description"],
            region=data["region"],
            culture=data["culture"],
            vacancy_type=data["vacancy_type"],
            salary=data["salary"],
            duration=data["duration"],
            producer_id=data["producer_id"],
            producer_name=data.get("producer_name", ""),
            expires_at=self._parse_timestamp(data["expires_at"]),
            created_at=self._parse_timestamp(data["created_at"]),
        )

    def _map_application_to_dict(self, app: Application) -> dict:
        return {
            "id": app.id,
            "opportunity_id": app.opportunity_id,
            "user_id": app.user_id,
            "user_name": app.user_name,
            "user_role": app.user_role,
            "applied_at": app.applied_at.isoformat(),
            "status": app.status,
        }

    def _map_dict_to_application(self, data: dict) -> Application:
        return Application(
            id=data["id"],
            opportunity_id=data["opportunity_id"],
            user_id=data["user_id"],
            user_name=data.get("user_name", ""),
            user_role=data.get("user_role", ""),
            applied_at=self._parse_timestamp(data["applied_at"]),
            status=data.get("status", "Pendente"),
        )
