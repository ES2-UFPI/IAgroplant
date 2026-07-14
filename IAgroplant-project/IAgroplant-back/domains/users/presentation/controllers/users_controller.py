from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.parsers import MultiPartParser, FormParser

from shared.utils.repository_factory import get_user_repository, get_reputation_repository
from domains.users.application.use_cases.get_profile_use_case import GetProfileUseCase
from domains.users.application.use_cases.update_profile_use_case import UpdateProfileUseCase, UpdateProfileInput
from domains.users.application.use_cases.update_profile_photo_use_case import UpdateProfilePhotoUseCase
from domains.users.application.use_cases.complete_initial_guidance_use_case import CompleteInitialGuidanceUseCase
from domains.users.application.use_cases.get_initial_guidance_status_use_case import GetInitialGuidanceStatusUseCase
from domains.users.application.use_cases.search_specialists_use_case import (
    SearchSpecialistsUseCase,
    SearchSpecialistsInput,
)
from domains.reputation.application.use_cases.get_reputation_summary_use_case import GetReputationSummaryUseCase
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


class SpecialistResultSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    region = serializers.CharField(allow_null=True)
    especialidades = serializers.ListField(child=serializers.CharField())
    certificado = serializers.BooleanField()
    photo_url = serializers.CharField(allow_null=True)
    reputacao = serializers.IntegerField()


class UpdateProfileSerializer(serializers.Serializer):
    # Propositalmente NÃO inclui email/certificado/photo_url — ver
    # UpdateProfileUseCase para a justificativa.
    name = serializers.CharField(required=False)
    region = serializers.CharField(required=False, allow_null=True)
    especialidades = serializers.ListField(child=serializers.CharField(), required=False)


class InitialGuidanceStatusSerializer(serializers.Serializer):
    user_id = serializers.CharField()
    role = serializers.CharField()
    completed = serializers.BooleanField()


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

        repo = get_user_repository()
        use_case = GetProfileUseCase(repository=repo)
        profile = use_case.execute(current_user)

        summary_use_case = GetReputationSummaryUseCase(repository=get_reputation_repository())
        summary = summary_use_case.execute(current_user.id)

        data = ProfileSerializer(profile).data
        data["reputacao"] = summary.total
        return Response(data, status=status.HTTP_200_OK)

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

        repo = get_user_repository()
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

        repo = get_user_repository()
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


class MeInitialGuidanceView(APIView):
    """
    GET /api/users/me/onboarding   - Consulta status e perfil do direcionamento inicial
    PATCH /api/users/me/onboarding - Marca o direcionamento inicial como concluído
    """

    def get(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        repo = get_user_repository()
        use_case = GetInitialGuidanceStatusUseCase(repository=repo)

        try:
            result = use_case.execute(current_user.id)
            serializer = InitialGuidanceStatusSerializer(result)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response(
                {"detail": "Erro interno ao consultar direcionamento inicial."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        repo = get_user_repository()
        use_case = CompleteInitialGuidanceUseCase(repository=repo)

        try:
            result = use_case.execute(current_user.id)
            serializer = InitialGuidanceStatusSerializer(result)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response(
                {"detail": "Erro interno ao concluir direcionamento inicial."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SpecialistSearchView(APIView):
    """
    GET /api/specialists/search?topic=macaxeira&region=Piauí

    Busca profissionais certificados cuja lista de especialidades contenha
    o tema pesquisado, ordenados por reputação (mais relevantes primeiro).
    Usado para que o usuário encontre um especialista e inicie uma conversa
    com ele no chat (Product Backlog #8).
    """

    def get(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

        topic = request.query_params.get("topic", "")
        region = request.query_params.get("region") or None

        use_case = SearchSpecialistsUseCase(
            user_repository=get_user_repository(),
            reputation_repository=get_reputation_repository(),
        )

        try:
            results = use_case.execute(SearchSpecialistsInput(topic=topic, region=region))
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            SpecialistResultSerializer(results, many=True).data,
            status=status.HTTP_200_OK,
        )
