import pytest
from unittest.mock import MagicMock
from domains.auth.domain.entities.user import User
from domains.posts.domain.entities.post import Post
from domains.moderations.application.use_cases.mark_post_verified_use_case import (
    MarkPostVerifiedUseCase,
    MarkPostVerifiedInput,
)
from domains.moderations.application.use_cases.remove_post_use_case import (
    RemovePostUseCase,
    RemovePostInput,
)


@pytest.fixture
def mock_post_repo():
    return MagicMock()


@pytest.fixture
def mock_reputation_repo():
    repo = MagicMock()
    repo.has_entry_reference.return_value = False
    repo.add_entry.side_effect = lambda e: e
    return repo


@pytest.fixture
def certified_moderator():
    return User(id="mod-1", email="mod@teste.com", name="Moderadora", role="Agrônoma", certificado=True)


@pytest.fixture
def uncertified_user():
    return User(id="user-2", email="user2@teste.com", name="Usuário Comum", role="Estudante", certificado=False)


@pytest.fixture
def sample_post():
    return Post(
        id="post-1",
        type="simple",
        content="Conteúdo de teste",
        image_url=None,
        tags=[],
        author_id="author-1",
        author_name="Autor",
        author_role="Produtor Rural",
        author_initials="AU",
        author_verified=False,
        region="Piauí",
    )


class TestMarkPostVerifiedUseCase:

    def test_verifies_post_and_awards_author(self, mock_post_repo, mock_reputation_repo, certified_moderator, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post
        mock_post_repo.save.side_effect = lambda p: p

        use_case = MarkPostVerifiedUseCase(post_repository=mock_post_repo, reputation_repository=mock_reputation_repo)
        updated = use_case.execute(MarkPostVerifiedInput(post_id="post-1", acting_user=certified_moderator))

        assert updated.author_verified is True
        mock_reputation_repo.add_entry.assert_called_once()
        awarded_entry = mock_reputation_repo.add_entry.call_args[0][0]
        assert awarded_entry.user_id == "author-1"
        assert awarded_entry.points == 10

    def test_blocks_uncertified_user(self, mock_post_repo, mock_reputation_repo, uncertified_user, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post

        use_case = MarkPostVerifiedUseCase(post_repository=mock_post_repo, reputation_repository=mock_reputation_repo)

        with pytest.raises(PermissionError):
            use_case.execute(MarkPostVerifiedInput(post_id="post-1", acting_user=uncertified_user))

    def test_blocks_already_verified_post(self, mock_post_repo, mock_reputation_repo, certified_moderator, sample_post):
        sample_post.author_verified = True
        mock_post_repo.get_by_id.return_value = sample_post

        use_case = MarkPostVerifiedUseCase(post_repository=mock_post_repo, reputation_repository=mock_reputation_repo)

        with pytest.raises(ValueError, match="já está marcado"):
            use_case.execute(MarkPostVerifiedInput(post_id="post-1", acting_user=certified_moderator))


class TestRemovePostUseCase:

    def test_removes_post_and_penalizes_author(self, mock_post_repo, mock_reputation_repo, certified_moderator, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post
        mock_post_repo.save.side_effect = lambda p: p

        use_case = RemovePostUseCase(post_repository=mock_post_repo, reputation_repository=mock_reputation_repo)
        updated = use_case.execute(RemovePostInput(post_id="post-1", acting_user=certified_moderator))

        assert updated.removed is True
        awarded_entry = mock_reputation_repo.add_entry.call_args[0][0]
        assert awarded_entry.user_id == "author-1"
        assert awarded_entry.points == -20

    def test_blocks_uncertified_user(self, mock_post_repo, mock_reputation_repo, uncertified_user, sample_post):
        mock_post_repo.get_by_id.return_value = sample_post

        use_case = RemovePostUseCase(post_repository=mock_post_repo, reputation_repository=mock_reputation_repo)

        with pytest.raises(PermissionError):
            use_case.execute(RemovePostInput(post_id="post-1", acting_user=uncertified_user))

    def test_blocks_already_removed_post(self, mock_post_repo, mock_reputation_repo, certified_moderator, sample_post):
        sample_post.removed = True
        mock_post_repo.get_by_id.return_value = sample_post

        use_case = RemovePostUseCase(post_repository=mock_post_repo, reputation_repository=mock_reputation_repo)

        with pytest.raises(ValueError, match="já foi removido"):
            use_case.execute(RemovePostInput(post_id="post-1", acting_user=certified_moderator))
