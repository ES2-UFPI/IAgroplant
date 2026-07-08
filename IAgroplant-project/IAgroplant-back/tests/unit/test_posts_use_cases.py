import pytest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from domains.posts.domain.entities.post import Post
from domains.posts.application.use_cases.create_post_use_case import CreatePostUseCase, CreatePostInput
from domains.posts.application.use_cases.list_posts_use_case import ListPostsUseCase, ListPostsInput
from domains.posts.application.use_cases.like_post_use_case import LikePostUseCase


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


# ─── ListPostsUseCase Tests ─────────────────────────────────────────────────

class TestListPostsUseCase:

    def test_list_posts_calls_repository(self, mock_post_repo, sample_post):
        mock_post_repo.list_posts.return_value = [sample_post]
        
        use_case = ListPostsUseCase(repository=mock_post_repo)
        results = use_case.execute(ListPostsInput(filter_category="Todos"))

        assert len(results) == 1
        assert results[0].id == "test-post-id"
        mock_post_repo.list_posts.assert_called_once_with(filter_category="Todos")


# ─── CreatePostUseCase Tests ────────────────────────────────────────────────

class TestCreatePostUseCase:

    def test_create_post_success(self, mock_post_repo):
        mock_post_repo.save.side_effect = lambda x: x
        use_case = CreatePostUseCase(repository=mock_post_repo)

        input_data = CreatePostInput(
            type="simple",
            content="Olá mundo agrícola!",
            image_url="http://image.com/1.png",
            tags=["milho", "praga"],
            author_id="user-123",
            author_name="Alice Souza",
            author_role="Agrônoma",
            author_verified=False,  # Será sobrescrevido pela regra de negócio (Agrônoma = True)
            region="Piauí"
        )

        post = use_case.execute(input_data)

        assert post.id is not None
        assert post.type == "simple"
        assert post.content == "Olá mundo agrícola!"
        assert post.author_verified is True  # Regra de negócio aplicada!
        assert post.author_initials == "AS"
        mock_post_repo.save.assert_called_once()

    def test_create_post_invalid_type_raises_error(self, mock_post_repo):
        use_case = CreatePostUseCase(repository=mock_post_repo)
        input_data = CreatePostInput(
            type="invalid_type",
            content="Teste",
            image_url=None,
            tags=[],
            author_id="1",
            author_name="Joao",
            author_role="Estudante",
            author_verified=False,
            region="Bahia"
        )

        with pytest.raises(ValueError, match="Tipo de post inválido"):
            use_case.execute(input_data)

    def test_create_post_empty_content_raises_error(self, mock_post_repo):
        use_case = CreatePostUseCase(repository=mock_post_repo)
        input_data = CreatePostInput(
            type="simple",
            content="",
            image_url=None,
            tags=[],
            author_id="1",
            author_name="Joao",
            author_role="Estudante",
            author_verified=False,
            region="Bahia"
        )

        with pytest.raises(ValueError, match="O conteúdo do post não pode ser vazio"):
            use_case.execute(input_data)


# ─── LikePostUseCase Tests ──────────────────────────────────────────────────

class TestLikePostUseCase:

    def test_like_post_success(self, mock_post_repo, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post
        mock_post_repo.like_post.return_value = True

        use_case = LikePostUseCase(repository=mock_post_repo)
        success = use_case.execute_like(post_id="test-post-id", user_id="user-999")

        assert success is True
        mock_post_repo.like_post.assert_called_once_with("test-post-id", "user-999")

    def test_unlike_post_success(self, mock_post_repo, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post
        mock_post_repo.unlike_post.return_value = True

        use_case = LikePostUseCase(repository=mock_post_repo)
        success = use_case.execute_unlike(post_id="test-post-id", user_id="user-123")

        assert success is True
        mock_post_repo.unlike_post.assert_called_once_with("test-post-id", "user-123")

    def test_like_non_existent_post_raises_error(self, mock_post_repo):
        mock_post_repo.get_by_id.return_value = None

        use_case = LikePostUseCase(repository=mock_post_repo)

        with pytest.raises(ValueError, match="Post não encontrado"):
            use_case.execute_like(post_id="non-existent", user_id="user-1")
