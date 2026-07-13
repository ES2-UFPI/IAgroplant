import pytest
from datetime import datetime, timezone
from domains.comments.domain.entities.comment import Comment


# ─── Comment Entity Tests ───────────────────────────────────────────────────

class TestCommentEntity:

    def test_create_comment_with_all_fields(self):
        created_at = datetime.now(timezone.utc)

        comment = Comment(
            id="comment-1",
            post_id="post-123",
            author_id="user-123",
            author_name="João Silva",
            author_role="Estudante",
            author_initials="JS",
            content="Ótimo post!",
            created_at=created_at
        )

        assert comment.id == "comment-1"
        assert comment.post_id == "post-123"
        assert comment.author_id == "user-123"
        assert comment.author_name == "João Silva"
        assert comment.author_role == "Estudante"
        assert comment.author_initials == "JS"
        assert comment.content == "Ótimo post!"
        assert comment.created_at == created_at

    def test_create_comment_default_created_at(self):
        before = datetime.now(timezone.utc)

        comment = Comment(
            id="comment-2",
            post_id="post-123",
            author_id="user-456",
            author_name="Maria Souza",
            author_role="Agrônoma",
            author_initials="MS",
            content="Muito útil, obrigada!"
        )

        after = datetime.now(timezone.utc)

        assert comment.created_at.tzinfo == timezone.utc
        assert before <= comment.created_at <= after
