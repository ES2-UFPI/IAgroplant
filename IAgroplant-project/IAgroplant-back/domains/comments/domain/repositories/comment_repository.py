from abc import ABC, abstractmethod
from typing import List
from domains.comments.domain.entities.comment import Comment


class CommentRepository(ABC):

    @abstractmethod
    def save(self, comment: Comment) -> Comment:
        pass

    @abstractmethod
    def list_by_post(self, post_id: str) -> List[Comment]:
        pass

    @abstractmethod
    def count_by_post(self, post_id: str) -> int:
        pass
