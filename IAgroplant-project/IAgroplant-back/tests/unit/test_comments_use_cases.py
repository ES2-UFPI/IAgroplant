import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
from domains.comments.domain.entities.comment import Comment
from domains.posts.domain.entities.post import Post
from domains.comments.application.use_cases.create_comment_use_case import (
    CreateCommentUseCase,
    CreateCommentInput,
)
from domains.comments.application.use_cases.list_comments_use_case import ListCommentsUseCase


@pytest.fixture
def mock_comment_repo():
    repo = MagicMock()
    return repo


@pytest.fixture
def mock_post_repo():
    repo = MagicMock()
    return repo


@pytest.fixture
def sample_post():
    return Post(
        id="test-post-id",
        type="simple",
        content="Conteúdo do post de teste",
        image_url=None,
        tags=["teste", "agronomia"],
        author_id="user-123",
        author_name="João Silva",
        author_role="Estudante",
        author_initials="JS",
        author_verified=False,
        region="Ceará",
        likes=[],
        comments_count=5,
        created_at=datetime.now(timezone.utc)
    )


@pytest.fixture
def sample_comment():
    return Comment(
        id="comment-1",
        post_id="test-post-id",
        author_id="user-123",
        author_name="João Silva",
        author_role="Estudante",
        author_initials="JS",
        content="Ótimo post!",
        created_at=datetime.now(timezone.utc)
    )


# ─── CreateCommentUseCase Tests ─────────────────────────────────────────────

class TestCreateCommentUseCase:

    def test_create_comment_success(self, mock_comment_repo, mock_post_repo, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post
        mock_comment_repo.save.side_effect = lambda x: x
        mock_post_repo.save.side_effect = lambda x: x

        use_case = CreateCommentUseCase(comment_repo=mock_comment_repo, post_repo=mock_post_repo)
        input_data = CreateCommentInput(
            post_id="test-post-id",
            author_id="user-123",
            author_name="João Silva",
            author_role="Estudante",
            author_initials="JS",
            content="Ótimo post!"
        )

        comment = use_case.execute(input_data)

        assert comment.id is not None
        assert comment.post_id == "test-post-id"
        assert comment.author_id == "user-123"
        assert comment.content == "Ótimo post!"
        mock_comment_repo.save.assert_called_once()

    def test_create_comment_empty_content_raises_error(self, mock_comment_repo, mock_post_repo, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post
        use_case = CreateCommentUseCase(comment_repo=mock_comment_repo, post_repo=mock_post_repo)
        input_data = CreateCommentInput(
            post_id="test-post-id",
            author_id="user-123",
            author_name="João Silva",
            author_role="Estudante",
            author_initials="JS",
            content=""
        )

        with pytest.raises(ValueError, match="O conteúdo do comentário não pode ser vazio"):
            use_case.execute(input_data)

    def test_create_comment_whitespace_only_content_raises_error(self, mock_comment_repo, mock_post_repo, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post
        use_case = CreateCommentUseCase(comment_repo=mock_comment_repo, post_repo=mock_post_repo)
        input_data = CreateCommentInput(
            post_id="test-post-id",
            author_id="user-123",
            author_name="João Silva",
            author_role="Estudante",
            author_initials="JS",
            content="    "
        )

        with pytest.raises(ValueError, match="O conteúdo do comentário não pode ser vazio"):
            use_case.execute(input_data)

    def test_create_comment_non_existent_post_raises_error(self, mock_comment_repo, mock_post_repo):
        mock_post_repo.get_by_id.return_value = None
        use_case = CreateCommentUseCase(comment_repo=mock_comment_repo, post_repo=mock_post_repo)
        input_data = CreateCommentInput(
            post_id="non-existent",
            author_id="user-123",
            author_name="João Silva",
            author_role="Estudante",
            author_initials="JS",
            content="Ótimo post!"
        )

        with pytest.raises(ValueError, match="Post não encontrado"):
            use_case.execute(input_data)

        mock_comment_repo.save.assert_not_called()

    def test_create_comment_increments_post_comments_count(self, mock_comment_repo, mock_post_repo, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post
        mock_comment_repo.save.side_effect = lambda x: x
        mock_post_repo.save.side_effect = lambda x: x

        use_case = CreateCommentUseCase(comment_repo=mock_comment_repo, post_repo=mock_post_repo)
        input_data = CreateCommentInput(
            post_id="test-post-id",
            author_id="user-123",
            author_name="João Silva",
            author_role="Estudante",
            author_initials="JS",
            content="Ótimo post!"
        )

        use_case.execute(input_data)

        mock_post_repo.save.assert_called_once()
        saved_post = mock_post_repo.save.call_args[0][0]
        assert saved_post.comments_count == 6


# ─── ListCommentsUseCase Tests ──────────────────────────────────────────────

class TestListCommentsUseCase:

    def test_list_comments_ordered_oldest_to_newest(self, mock_comment_repo):
        now = datetime.now(timezone.utc)
        newest = Comment(
            id="comment-newest", post_id="test-post-id", author_id="user-1",
            author_name="Ana", author_role="Estudante", author_initials="A",
            content="Mais novo", created_at=now
        )
        oldest = Comment(
            id="comment-oldest", post_id="test-post-id", author_id="user-2",
            author_name="Bruno", author_role="Estudante", author_initials="B",
            content="Mais antigo", created_at=now - timedelta(days=2)
        )
        middle = Comment(
            id="comment-middle", post_id="test-post-id", author_id="user-3",
            author_name="Carla", author_role="Estudante", author_initials="C",
            content="Meio termo", created_at=now - timedelta(days=1)
        )
        mock_comment_repo.list_by_post.return_value = [newest, oldest, middle]

        use_case = ListCommentsUseCase(comment_repo=mock_comment_repo)
        results = use_case.execute(post_id="test-post-id")

        assert [c.id for c in results] == ["comment-oldest", "comment-middle", "comment-newest"]
        mock_comment_repo.list_by_post.assert_called_once_with("test-post-id")

    def test_list_comments_returns_empty_list_when_no_comments(self, mock_comment_repo):
        mock_comment_repo.list_by_post.return_value = []

        use_case = ListCommentsUseCase(comment_repo=mock_comment_repo)
        results = use_case.execute(post_id="test-post-id")

        assert results == []
