from datetime import datetime, timezone
from typing import List, Optional
from supabase import Client
from domains.posts.domain.entities.post import Post
from domains.posts.domain.repositories.post_repository import PostRepository
from integrations.database.supabase_client import get_supabase_client


class SupabasePostRepository(PostRepository):

    def __init__(self, client: Optional[Client] = None):
        self._client = client or get_supabase_client()

    def save(self, post: Post) -> Post:
        if not self._client:
            return post
        data = self._map_post_to_dict(post)
        try:
            self._client.table("posts").upsert(data).execute()
        except Exception:
            pass
        return post

    def get_by_id(self, post_id: str) -> Optional[Post]:
        if not self._client:
            return None
        try:
            response = (
                self._client.table("posts")
                .select("*")
                .eq("id", post_id)
                .single()
                .execute()
            )
            if not response.data:
                return None
            
            # Busca as curtidas deste post
            likes = self._get_likes_for_post(post_id)
            return self._map_dict_to_post(response.data, likes)
        except Exception:
            return None

    def list_posts(self, filter_category: Optional[str] = None, tag: Optional[str] = None) -> List[Post]:
        if not self._client:
            return []
        try:
            query = self._client.table("posts").select("*")
            
            if tag:
                query = query.cs("tags", [tag])
                
            if filter_category and filter_category != "Todos":
                category_map = {
                    "Diagnóstico IA": "diagnostic",
                    "Vagas": "opportunity",
                }
                if filter_category in category_map:
                    query = query.eq("type", category_map[filter_category])
                else:
                    query = query.cs("tags", [filter_category])
            
            # Ordenação decrescente por data
            response = query.order("created_at", desc=True).execute()
            if not response.data:
                return []
            
            posts = []
            for item in response.data:
                likes = self._get_likes_for_post(item["id"])
                posts.append(self._map_dict_to_post(item, likes))
            return posts
        except Exception as e:
            import traceback
            traceback.print_exc()
            return []

    def like_post(self, post_id: str, user_id: str) -> bool:
        if not self._client:
            return False
        try:
            # Verifica se já está curtido para evitar duplicados
            existing = (
                self._client.table("post_likes")
                .select("id")
                .eq("post_id", post_id)
                .eq("user_id", user_id)
                .execute()
            )
            if existing.data:
                return True
            
            self._client.table("post_likes").insert({
                "post_id": post_id,
                "user_id": user_id
            }).execute()
            return True
        except Exception:
            return False

    def unlike_post(self, post_id: str, user_id: str) -> bool:
        if not self._client:
            return False
        try:
            self._client.table("post_likes").delete().eq("post_id", post_id).eq("user_id", user_id).execute()
            return True
        except Exception:
            return False

    def _get_likes_for_post(self, post_id: str) -> List[str]:
        if not self._client:
            return []
        try:
            response = (
                self._client.table("post_likes")
                .select("user_id")
                .eq("post_id", post_id)
                .execute()
            )
            if not response.data:
                return []
            return [item["user_id"] for item in response.data]
        except Exception as e:
            import traceback
            traceback.print_exc()
            return []

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

    def _map_post_to_dict(self, p: Post) -> dict:
        return {
            "id": p.id,
            "type": p.type,
            "content": p.content,
            "image_url": p.image_url,
            "tags": p.tags,
            "author_id": p.author_id,
            "author_name": p.author_name,
            "author_role": p.author_role,
            "author_initials": p.author_initials,
            "author_verified": p.author_verified,
            "region": p.region,
            "comments_count": p.comments_count,
            "created_at": p.created_at.isoformat(),
            "pathogen": p.pathogen,
            "severity": p.severity,
            "salary": p.salary,
            "duration": p.duration,
        }

    def _map_dict_to_post(self, data: dict, likes: List[str]) -> Post:
        return Post(
            id=data["id"],
            type=data["type"],
            content=data["content"],
            image_url=data.get("image_url"),
            tags=data.get("tags") or [],
            author_id=data["author_id"],
            author_name=data.get("author_name", ""),
            author_role=data.get("author_role", ""),
            author_initials=data.get("author_initials", ""),
            author_verified=data.get("author_verified", False),
            region=data.get("region", ""),
            likes=likes,
            comments_count=data.get("comments_count", 0),
            created_at=self._parse_timestamp(data["created_at"]),
            pathogen=data.get("pathogen"),
            severity=data.get("severity"),
            salary=data.get("salary"),
            duration=data.get("duration"),
        )
