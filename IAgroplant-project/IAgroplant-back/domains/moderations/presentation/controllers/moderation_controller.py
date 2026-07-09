from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from shared.utils.repository_factory import get_post_repository, get_reputation_repository
from domains.moderations.application.use_cases.mark_post_verified_use_case import (
    MarkPostVerifiedUseCase,
    MarkPostVerifiedInput,
)
from domains.moderations.application.use_cases.remove_post_use_case import (
    RemovePostUseCase,
    RemovePostInput,
)


class MarkPostVerifiedView(APIView):
    """
    POST /api/moderation/posts/<post_id>/verify - Marca o post como conteúdo verificado.
    """

    def post(self, request, post_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        use_case = MarkPostVerifiedUseCase(
            post_repository=get_post_repository(),
            reputation_repository=get_reputation_repository(),
        )

        try:
            use_case.execute(MarkPostVerifiedInput(post_id=post_id, acting_user=current_user))
            return Response({"success": True}, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RemovePostView(APIView):
    """
    POST /api/moderation/posts/<post_id>/remove - Remove o post por violação das diretrizes.
    """

    def post(self, request, post_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        use_case = RemovePostUseCase(
            post_repository=get_post_repository(),
            reputation_repository=get_reputation_repository(),
        )

        try:
            use_case.execute(RemovePostInput(post_id=post_id, acting_user=current_user))
            return Response({"success": True}, status=status.HTTP_200_OK)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
