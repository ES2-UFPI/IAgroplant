import pytest
from datetime import datetime, timezone
from domains.comments.domain.entities.comment import Comment
from domains.comments.infrastructure.persistence.postgres_comment_repository import PostgresCommentRepository


@pytest.fixture
def repo():
    return PostgresCommentRepository()


# ─── Mock Data Tests ────────────────────────────────────────────────────────

class TestPostgresCommentRepositoryMockData:

    def test_prepopulated_comments_exist_for_post_1(self, repo):
        comments = repo.list_by_post("post-1")

        assert len(comments) >= 2
        assert all(c.post_id == "post-1" for c in comments)

    def test_count_by_post_matches_prepopulated_comments(self, repo):
        comments = repo.list_by_post("post-1")

        assert repo.count_by_post("post-1") == len(comments)


# ─── save() Tests ───────────────────────────────────────────────────────────

class TestPostgresCommentRepositorySave:

    def test_save_adds_new_comment(self, repo):
        comment = Comment(
            id="comment-repo-test-1",
            post_id="post-repo-test",
            author_id="user-1",
            author_name="Teste",
            author_role="Estudante",
            author_initials="T",
            content="Comentário de teste",
            created_at=datetime.now(timezone.utc),
        )

        saved = repo.save(comment)

        assert saved.id == "comment-repo-test-1"
        results = repo.list_by_post("post-repo-test")
        assert len(results) == 1
        assert results[0].id == "comment-repo-test-1"

    def test_save_updates_existing_comment(self, repo):
        comment = Comment(
            id="comment-repo-test-2",
            post_id="post-repo-test-update",
            author_id="user-1",
            author_name="Teste",
            author_role="Estudante",
            author_initials="T",
            content="Versão original",
            created_at=datetime.now(timezone.utc),
        )
        repo.save(comment)

        comment.content = "Versão editada"
        repo.save(comment)

        results = repo.list_by_post("post-repo-test-update")
        assert len(results) == 1
        assert results[0].content == "Versão editada"


# ─── list_by_post() / count_by_post() Tests ────────────────────────────────

class TestPostgresCommentRepositoryListAndCount:

    def test_list_by_post_returns_empty_list_for_unknown_post(self, repo):
        assert repo.list_by_post("post-does-not-exist") == []

    def test_count_by_post_returns_correct_count(self, repo):
        post_id = "post-repo-test-count"
        for i in range(2):
            repo.save(Comment(
                id=f"comment-count-{i}",
                post_id=post_id,
                author_id="user-1",
                author_name="Teste",
                author_role="Estudante",
                author_initials="T",
                content=f"Comentário {i}",
                created_at=datetime.now(timezone.utc),
            ))

        assert repo.count_by_post(post_id) == 2

    def test_count_by_post_returns_zero_for_unknown_post(self, repo):
        assert repo.count_by_post("post-does-not-exist-count") == 0
