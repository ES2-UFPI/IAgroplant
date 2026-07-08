from datetime import datetime, timezone
from typing import List, Optional
from supabase import Client
from domains.notifications.domain.entities.notification import Notification, NotificationPreference
from domains.notifications.domain.repositories.notification_repository import NotificationRepository
from integrations.database.supabase_client import get_supabase_client


class SupabaseNotificationRepository(NotificationRepository):

    def __init__(self, client: Optional[Client] = None):
        self._client = client or get_supabase_client()

    def create(self, notification: Notification) -> Notification:
        if not self._client:
            return notification
        data = self._map_notification_to_dict(notification)
        try:
            self._client.table("notifications").upsert(data).execute()
        except Exception:
            pass
        return notification

    def find_by_user_id(self, user_id: str) -> List[Notification]:
        if not self._client:
            return []
        try:
            response = (
                self._client.table("notifications")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            if not response.data:
                return []
            return [self._map_dict_to_notification(item) for item in response.data]
        except Exception:
            return []

    def mark_as_read(self, notification_id: str) -> bool:
        if not self._client:
            return True
        try:
            self._client.table("notifications").update({"is_read": True}).eq("id", notification_id).execute()
            return True
        except Exception:
            return False

    def get_preferences(self, user_id: str) -> List[NotificationPreference]:
        default_prefs = [
            NotificationPreference(user_id=user_id, type="FEED_POST", enabled=True),
            NotificationPreference(user_id=user_id, type="CHAT_MESSAGE", enabled=True),
            NotificationPreference(user_id=user_id, type="OPPORTUNITY", enabled=True),
            NotificationPreference(user_id=user_id, type="SYSTEM", enabled=True),
        ]
        if not self._client:
            return default_prefs
        try:
            response = (
                self._client.table("notification_preferences")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            if not response.data:
                return default_prefs
            
            db_prefs = {item["type"]: item["enabled"] for item in response.data}
            for pref in default_prefs:
                if pref.type in db_prefs:
                    pref.enabled = db_prefs[pref.type]
            return default_prefs
        except Exception:
            return default_prefs

    def update_preferences(
        self,
        user_id: str,
        preferences: List[NotificationPreference]
    ) -> List[NotificationPreference]:
        if not self._client:
            return preferences
        try:
            for pref in preferences:
                data = {
                    "user_id": user_id,
                    "type": pref.type,
                    "enabled": pref.enabled
                }
                self._client.table("notification_preferences").upsert(data, on_conflict="user_id,type").execute()
        except Exception:
            pass
        return preferences

    def _parse_timestamp(self, ts_str: str) -> datetime:
        if not ts_str:
            return datetime.utcnow()
        ts_str = ts_str.replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(ts_str)
        except ValueError:
            try:
                return datetime.strptime(ts_str[:19], "%Y-%m-%dT%H:%M:%S")
            except ValueError:
                return datetime.utcnow()

    def _map_notification_to_dict(self, n: Notification) -> dict:
        return {
            "id": n.id,
            "user_id": n.user_id,
            "title": n.title,
            "body": n.body,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
            "metadata": n.metadata,
        }

    def _map_dict_to_notification(self, data: dict) -> Notification:
        return Notification(
            id=data["id"],
            user_id=data["user_id"],
            title=data["title"],
            body=data["body"],
            type=data["type"],
            is_read=data.get("is_read", False),
            created_at=self._parse_timestamp(data["created_at"]),
            metadata=data.get("metadata"),
        )
