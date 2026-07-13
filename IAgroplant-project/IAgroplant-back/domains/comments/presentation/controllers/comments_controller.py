from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from django.utils.timezone import now

# Import core elements
from shared.utils.repository_factory import get_comment_repository, get_post_repository
from domains.comments.application.use_cases.create_comment_use_case import CreateCommentUseCase, CreateCommentInput
from domains.comments.application.use_cases.list_comments_use_case import ListCommentsUseCase


# ─── SERIALIZERS ──────────────────────────────────────────────────────────────

class CommentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    content = serializers.CharField()
    author = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    def get_author(self, obj):
        return {
            "id": obj.author_id,
            "name": obj.author_name,
            "role": obj.author_role,
            "initials": obj.author_initials,
        }

    def get_time(self, obj):
        diff = now() - obj.created_at
        if diff.days > 0:
            return f"há {diff.days}d"
        hours = diff.seconds // 3600
        if hours > 0:
            return f"há {hours}h"
        minutes = (diff.seconds % 3600) // 60
        if minutes > 0:
            return f"há {minutes}m"
        return "agora"


# ─── VIEWS ───────────────────────────────────────────────────────────────────

class ListCreateCommentsView(APIView):
    """
    GET /api/posts/<post_id>/comments - Lista comentários de um post
    POST /api/posts/<post_id>/comments - Cria um novo comentário
    """

    def get(self, request, post_id):
        repo = get_comment_repository()
        use_case = ListCommentsUseCase(comment_repo=repo)

        comments = use_case.execute(post_id=post_id)

        serializer = CommentSerializer(comments, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, post_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = CommentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        comment_repo = get_comment_repository()
        post_repo = get_post_repository()
        use_case = CreateCommentUseCase(comment_repo=comment_repo, post_repo=post_repo)

        # Iniciais do autor (mesma regra usada em CreatePostUseCase)
        initials = "".join([n[0] for n in current_user.name.split() if n])[:2].upper()
        if not initials:
            initials = "US"

        try:
            comment = use_case.execute(
                CreateCommentInput(
                    post_id=post_id,
                    author_id=current_user.id,
                    author_name=current_user.name,
                    author_role=current_user.role,
                    author_initials=initials,
                    content=serializer.validated_data["content"],
                )
            )
            serializer = CommentSerializer(comment, context={"request": request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
