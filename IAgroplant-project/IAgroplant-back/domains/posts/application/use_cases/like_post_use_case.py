from domains.posts.domain.repositories.post_repository import PostRepository


class LikePostUseCase:

    def __init__(self, repository: PostRepository):
        self._repo = repository

    def execute_like(self, post_id: str, user_id: str) -> bool:
        post = self._repo.get_by_id(post_id)
        if not post:
            raise ValueError("Post não encontrado.")
        return self._repo.like_post(post_id, user_id)

    def execute_unlike(self, post_id: str, user_id: str) -> bool:
        post = self._repo.get_by_id(post_id)
        if not post:
            raise ValueError("Post não encontrado.")
        return self._repo.unlike_post(post_id, user_id)
