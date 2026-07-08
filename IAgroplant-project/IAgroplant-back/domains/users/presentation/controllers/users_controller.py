from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.parsers import MultiPartParser, FormParser

from domains.users.infrastructure.persistence.postgres_user_repository import PostgresUserRepository
from domains.users.application.use_cases.get_profile_use_case import GetProfileUseCase
from domains.users.application.use_cases.update_profile_use_case import UpdateProfileUseCase, UpdateProfileInput
from domains.users.application.use_cases.update_profile_photo_use_case import UpdateProfilePhotoUseCase
from integrations.storage.cloudinary_service import CloudinaryStorageService


# ─── SERIALIZERS ──────────────────────────────────────────────────────────────

class ProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()
    email = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    region = serializers.CharField(required=False, allow_null=True)
    certificado = serializers.BooleanField(read_only=True)
    especialidades = serializers.ListField(child=serializers.CharField(), required=False)
    photo_url = serializers.CharField(read_only=True, allow_null=True)


class UpdateProfileSerializer(serializers.Serializer):
    # Propositalmente NÃO inclui email/certificado/photo_url — ver
    # UpdateProfileUseCase para a justificativa.
    name = serializers.CharField(required=False)
    region = serializers.CharField(required=False, allow_null=True)
    especialidades = serializers.ListField(child=serializers.CharField(), required=False)


# ─── VIEWS ───────────────────────────────────────────────────────────────────

class MeProfileView(APIView):
    """
    GET /api/users/me  - Consulta o perfil do usuário autenticado
    PUT /api/users/me  - Atualiza name/region/especialidades
    """

    def get(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        repo = PostgresUserRepository()
        use_case = GetProfileUseCase(repository=repo)
        profile = use_case.execute(current_user)

        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = UpdateProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        repo = PostgresUserRepository()
        use_case = UpdateProfileUseCase(repository=repo)

        try:
            updated = use_case.execute(
                current_user,
                UpdateProfileInput(
                    name=serializer.validated_data.get("name"),
                    region=serializer.validated_data.get("region"),
                    especialidades=serializer.validated_data.get("especialidades"),
                )
            )
            response_serializer = ProfileSerializer(updated)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"detail": "Erro interno ao atualizar perfil."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MeProfilePhotoView(APIView):
    """
    POST /api/users/me/photo - Envia/atualiza a foto de perfil (multipart/form-data, campo "photo")
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        photo = request.FILES.get("photo")
        if not photo:
            return Response(
                {"detail": "Arquivo 'photo' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )

        repo = PostgresUserRepository()
        storage = CloudinaryStorageService()
        use_case = UpdateProfilePhotoUseCase(repository=repo, storage_service=storage)

        try:
            updated = use_case.execute(current_user, photo)
            serializer = ProfileSerializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"detail": "Erro interno ao enviar a foto de perfil."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
