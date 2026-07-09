from dataclasses import dataclass, replace
from domains.auth.domain.entities.user import User
from domains.posts.domain.repositories.post_repository import PostRepository
from domains.reputation.domain.repositories.reputation_repository import ReputationRepository
from domains.reputation.domain.entities.reputation_action import POST_VERIFIED
from domains.reputation.application.use_cases.award_reputation_use_case import (
    AwardReputationUseCase,
    AwardReputationInput,
)


@dataclass
class MarkPostVerifiedInput:
    post_id: str
    acting_user: User


class MarkPostVerifiedUseCase:

    def __init__(self, post_repository: PostRepository, reputation_repository: ReputationRepository):
        self._posts = post_repository
        self._reputation = reputation_repository

    def execute(self, input_data: MarkPostVerifiedInput):
        acting_user = input_data.acting_user
        if not (acting_user.certificado or acting_user.role.lower() == "admin"):
            raise PermissionError(
                "Somente profissionais certificados ou administradores podem marcar posts como verificados."
            )

        post = self._posts.get_by_id(input_data.post_id)
        if not post:
            raise ValueError("Post não encontrado.")

        if post.author_verified:
            raise ValueError("Post já está marcado como verificado.")

        updated_post = replace(post, author_verified=True)
        self._posts.save(updated_post)

        AwardReputationUseCase(repository=self._reputation).execute(
            AwardReputationInput(
                user_id=post.author_id,
                action_type=POST_VERIFIED,
                reason=f'Post "{post.id}" marcado como conteúdo verificado.',
                reference_id=f"post_verified:{post.id}",
            )
        )

        return updated_post
