import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from domains.comments.domain.entities.comment import Comment
from domains.comments.domain.repositories.comment_repository import CommentRepository
from domains.posts.domain.repositories.post_repository import PostRepository


@dataclass
class CreateCommentInput:
    post_id: str
    author_id: str
    author_name: str
    author_role: str
    author_initials: str
    content: str


class CreateCommentUseCase:

    def __init__(self, comment_repo: CommentRepository, post_repo: PostRepository):
        self._comment_repo = comment_repo
        self._post_repo = post_repo

    def execute(self, input_data: CreateCommentInput) -> Comment:
        if not input_data.content or not input_data.content.strip():
            raise ValueError("O conteúdo do comentário não pode ser vazio.")

        post = self._post_repo.get_by_id(input_data.post_id)
        if not post:
            raise ValueError("Post não encontrado.")

        comment = Comment(
            id=str(uuid.uuid4()),
            post_id=input_data.post_id,
            author_id=input_data.author_id,
            author_name=input_data.author_name,
            author_role=input_data.author_role,
            author_initials=input_data.author_initials,
            content=input_data.content,
            created_at=datetime.now(timezone.utc),
        )

        saved_comment = self._comment_repo.save(comment)

        post.comments_count += 1
        self._post_repo.save(post)

        return saved_comment
