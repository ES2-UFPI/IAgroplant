from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from shared.utils.repository_factory import get_reputation_repository
from domains.reputation.application.use_cases.mark_chat_reply_useful_use_case import (
    MarkChatReplyUsefulUseCase,
    MarkChatReplyUsefulInput,
)


class MarkChatReplyUsefulView(APIView):
    """
    POST /api/chat/mark-useful - Marca uma mensagem de chat de outro usuário como útil.
    Body: { "recipient_user_id": "...", "message_id": "..." }
    """

    def post(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        recipient_user_id = request.data.get("recipient_user_id")
        message_id = request.data.get("message_id")
        if not recipient_user_id or not message_id:
            return Response(
                {"detail": "'recipient_user_id' e 'message_id' são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        use_case = MarkChatReplyUsefulUseCase(repository=get_reputation_repository())

        try:
            use_case.execute(
                MarkChatReplyUsefulInput(
                    marking_user_id=current_user.id,
                    recipient_user_id=recipient_user_id,
                    message_id=message_id,
                )
            )
            return Response({"success": True}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
