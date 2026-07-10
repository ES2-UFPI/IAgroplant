from abc import ABC, abstractmethod
from typing import List, Optional
from domains.posts.domain.entities.post import Post


class PostRepository(ABC):

    @abstractmethod
    def save(self, post: Post) -> Post:
        pass

    @abstractmethod
    def get_by_id(self, post_id: str) -> Optional[Post]:
        pass

    @abstractmethod
    def list_posts(self, filter_category: Optional[str] = None, tag: Optional[str] = None) -> List[Post]:
        pass

    @abstractmethod
    def like_post(self, post_id: str, user_id: str) -> bool:
        pass

    @abstractmethod
    def unlike_post(self, post_id: str, user_id: str) -> bool:
        pass
