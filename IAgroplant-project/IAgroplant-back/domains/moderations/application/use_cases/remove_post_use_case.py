from dataclasses import dataclass, replace
from domains.auth.domain.entities.user import User
from domains.posts.domain.repositories.post_repository import PostRepository
from domains.reputation.domain.repositories.reputation_repository import ReputationRepository
from domains.reputation.domain.entities.reputation_action import POST_REMOVED_VIOLATION
from domains.reputation.application.use_cases.award_reputation_use_case import (
    AwardReputationUseCase,
    AwardReputationInput,
)


@dataclass
class RemovePostInput:
    post_id: str
    acting_user: User


class RemovePostUseCase:

    def __init__(self, post_repository: PostRepository, reputation_repository: ReputationRepository):
        self._posts = post_repository
        self._reputation = reputation_repository

    def execute(self, input_data: RemovePostInput):
        acting_user = input_data.acting_user
        if not (acting_user.certificado or acting_user.role.lower() == "admin"):
            raise PermissionError(
                "Somente profissionais certificados ou administradores podem remover posts."
            )

        post = self._posts.get_by_id(input_data.post_id)
        if not post:
            raise ValueError("Post não encontrado.")

        if post.removed:
            raise ValueError("Post já foi removido.")

        updated_post = replace(post, removed=True)
        self._posts.save(updated_post)

        AwardReputationUseCase(repository=self._reputation).execute(
            AwardReputationInput(
                user_id=post.author_id,
                action_type=POST_REMOVED_VIOLATION,
                reason=f'Post "{post.id}" removido por violação das diretrizes.',
                reference_id=f"post_removed:{post.id}",
            )
        )

        return updated_post
