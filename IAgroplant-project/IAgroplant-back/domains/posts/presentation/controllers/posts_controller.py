from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from django.utils.timezone import now

# Import core elements
from shared.utils.repository_factory import get_post_repository
from domains.posts.application.use_cases.create_post_use_case import CreatePostUseCase, CreatePostInput
from domains.posts.application.use_cases.list_posts_use_case import ListPostsUseCase, ListPostsInput
from domains.posts.application.use_cases.like_post_use_case import LikePostUseCase


# ─── SERIALIZERS ──────────────────────────────────────────────────────────────

class PostSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    type = serializers.CharField(max_length=50)
    content = serializers.CharField()
    image = serializers.CharField(source="image_url", allow_null=True, required=False, default=None)
    tags = serializers.ListField(child=serializers.CharField())
    author = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    comments = serializers.IntegerField(source="comments_count", read_only=True)
    region = serializers.CharField(max_length=100)
    time = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()

    # Specific fields
    pathogen = serializers.CharField(allow_null=True, required=False, default=None)
    severity = serializers.CharField(allow_null=True, required=False, default=None)
    salary = serializers.CharField(allow_null=True, required=False, default=None)
    duration = serializers.CharField(allow_null=True, required=False, default=None)

    def get_author(self, obj):
        return {
            "id": obj.author_id,
            "name": obj.author_name,
            "role": obj.author_role,
            "initials": obj.author_initials,
            "verified": obj.author_verified
        }

    def get_likes(self, obj):
        return len(obj.likes)

    def get_liked(self, obj):
        request = self.context.get("request")
        if request and hasattr(request, "current_user") and request.current_user:
            return obj.is_liked_by(request.current_user.id)
        return False

    def get_category(self, obj):
        if obj.type == "diagnostic":
            return "Diagnóstico IA"
        elif obj.type == "opportunity":
            return "Vagas"
        return "Manejo"

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

class ListCreatePostsView(APIView):
    """
    GET /api/posts/ - List / filter posts from feed
    POST /api/posts/ - Create new post
    """

    def get(self, request):
        filter_category = request.query_params.get("filter", "Todos")
        tag = request.query_params.get("tag")
        repo = get_post_repository()
        use_case = ListPostsUseCase(repository=repo)
        
        posts = use_case.execute(ListPostsInput(filter_category=filter_category, tag=tag))
        
        serializer = PostSerializer(posts, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Authenticated user injected by JWTMiddleware
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = PostSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        repo = get_post_repository()
        use_case = CreatePostUseCase(repository=repo)

        try:
            post = use_case.execute(
                CreatePostInput(
                    type=serializer.validated_data["type"],
                    content=serializer.validated_data["content"],
                    image_url=serializer.validated_data.get("image_url"),
                    tags=serializer.validated_data["tags"],
                    author_id=current_user.id,
                    author_name=current_user.name,
                    author_role=current_user.role,
                    author_verified=current_user.certificado,
                    region=serializer.validated_data["region"],
                    pathogen=serializer.validated_data.get("pathogen"),
                    severity=serializer.validated_data.get("severity"),
                    salary=serializer.validated_data.get("salary"),
                    duration=serializer.validated_data.get("duration"),
                )
            )
            serializer = PostSerializer(post, context={"request": request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LikePostView(APIView):
    """
    POST /api/posts/<id>/like - Curtir um post
    """

    def post(self, request, post_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        repo = get_post_repository()
        use_case = LikePostUseCase(repository=repo)

        try:
            success = use_case.execute_like(post_id=post_id, user_id=current_user.id)
            return Response({"success": success}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)


class UnlikePostView(APIView):
    """
    POST /api/posts/<id>/unlike - Descurtir um post
    """

    def post(self, request, post_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        repo = get_post_repository()
        use_case = LikePostUseCase(repository=repo)

        try:
            success = use_case.execute_unlike(post_id=post_id, user_id=current_user.id)
            return Response({"success": success}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
