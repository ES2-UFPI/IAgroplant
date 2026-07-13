from typing import List
from domains.comments.domain.entities.comment import Comment
from domains.comments.domain.repositories.comment_repository import CommentRepository


class ListCommentsUseCase:

    def __init__(self, comment_repo: CommentRepository):
        self._repo = comment_repo

    def execute(self, post_id: str) -> List[Comment]:
        comments = self._repo.list_by_post(post_id)
        return sorted(comments, key=lambda c: c.created_at)
