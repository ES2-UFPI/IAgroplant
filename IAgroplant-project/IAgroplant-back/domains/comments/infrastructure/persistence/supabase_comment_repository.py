from datetime import datetime, timezone
from typing import List, Optional
from supabase import Client
from domains.comments.domain.entities.comment import Comment
from domains.comments.domain.repositories.comment_repository import CommentRepository
from integrations.database.supabase_client import get_supabase_client


class SupabaseCommentRepository(CommentRepository):

    def __init__(self, client: Optional[Client] = None):
        self._client = client or get_supabase_client()

    def save(self, comment: Comment) -> Comment:
        if not self._client:
            return comment
        data = self._map_comment_to_dict(comment)
        try:
            self._client.table("comments").upsert(data).execute()
        except Exception:
            pass
        return comment

    def list_by_post(self, post_id: str) -> List[Comment]:
        if not self._client:
            return []
        try:
            response = (
                self._client.table("comments")
                .select("*")
                .eq("post_id", post_id)
                .order("created_at")
                .execute()
            )
            if not response.data:
                return []
            return [self._map_dict_to_comment(item) for item in response.data]
        except Exception as e:
            print(f"Error in list_by_post: {e}")
            return []

    def count_by_post(self, post_id: str) -> int:
        if not self._client:
            return 0
        try:
            response = (
                self._client.table("comments")
                .select("id", count="exact")
                .eq("post_id", post_id)
                .execute()
            )
            return response.count or 0
        except Exception:
            return 0

    def _parse_timestamp(self, ts_str: str) -> datetime:
        if not ts_str:
            return datetime.now(timezone.utc)
        ts_str = ts_str.replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(ts_str)
        except ValueError:
            try:
                return datetime.strptime(ts_str[:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
            except ValueError:
                return datetime.now(timezone.utc)

    def _map_comment_to_dict(self, c: Comment) -> dict:
        return {
            "id": c.id,
            "post_id": c.post_id,
            "author_id": c.author_id,
            "author_name": c.author_name,
            "author_role": c.author_role,
            "author_initials": c.author_initials,
            "content": c.content,
            "created_at": c.created_at.isoformat(),
        }

    def _map_dict_to_comment(self, data: dict) -> Comment:
        return Comment(
            id=data["id"],
            post_id=data["post_id"],
            author_id=data["author_id"],
            author_name=data.get("author_name", ""),
            author_role=data.get("author_role", ""),
            author_initials=data.get("author_initials", ""),
            content=data["content"],
            created_at=self._parse_timestamp(data["created_at"]),
        )
