from dataclasses import dataclass
from typing import List, Optional
from domains.posts.domain.entities.post import Post
from domains.posts.domain.repositories.post_repository import PostRepository


@dataclass
class ListPostsInput:
    filter_category: Optional[str] = None
    tag: Optional[str] = None


class ListPostsUseCase:

    def __init__(self, repository: PostRepository):
        self._repo = repository

    def execute(self, input_data: ListPostsInput) -> List[Post]:
        return self._repo.list_posts(filter_category=input_data.filter_category, tag=input_data.tag)
