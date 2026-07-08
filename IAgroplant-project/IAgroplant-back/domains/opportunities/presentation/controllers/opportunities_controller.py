from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers

# Import core elements
from shared.utils.repository_factory import get_opportunity_repository
from domains.opportunities.infrastructure.notifications.notification_service import NotificationService
from domains.opportunities.application.use_cases.create_vacancy_use_case import CreateVacancyUseCase, CreateVacancyInput
from domains.opportunities.application.use_cases.search_vacancies_use_case import SearchVacanciesUseCase, SearchFilters
from domains.opportunities.application.use_cases.apply_to_vacancy_use_case import ApplyToVacancyUseCase, ApplyToVacancyInput
from domains.opportunities.application.use_cases.get_user_applications_use_case import GetUserApplicationsUseCase


# ─── SERIALIZERS ──────────────────────────────────────────────────────────────

class VacancySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    region = serializers.CharField(max_length=100)
    culture = serializers.CharField(max_length=100)
    vacancy_type = serializers.ChoiceField(choices=["Estágio", "Emprego", "Freelance"])
    salary = serializers.CharField(max_length=100)
    duration = serializers.CharField(max_length=100)
    producer_id = serializers.CharField(read_only=True)
    producer_name = serializers.CharField(read_only=True)
    expires_at = serializers.DateTimeField()
    created_at = serializers.DateTimeField(read_only=True)


class ApplicationSerializer(serializers.Serializer):
    id = serializers.CharField()
    opportunity_id = serializers.CharField()
    user_id = serializers.CharField()
    user_name = serializers.CharField()
    user_role = serializers.CharField()
    applied_at = serializers.DateTimeField()
    status = serializers.CharField()
    
    # Extra fields for premium user experience
    vacancy_title = serializers.CharField(required=False, allow_null=True)
    vacancy_region = serializers.CharField(required=False, allow_null=True)
    vacancy_culture = serializers.CharField(required=False, allow_null=True)


# ─── VIEWS ───────────────────────────────────────────────────────────────────

class ListCreateOpportunitiesView(APIView):
    """
    GET /api/opportunities/ - List/Filter active vacancies
    POST /api/opportunities/ - Create new vacancy (Rural Producers only)
    """

    def get(self, request):
        region = request.query_params.get("region")
        culture = request.query_params.get("culture")
        vacancy_type = request.query_params.get("vacancy_type")

        repo = get_opportunity_repository()
        use_case = SearchVacanciesUseCase(repository=repo)
        
        vacancies = use_case.execute(
            SearchFilters(region=region, culture=culture, vacancy_type=vacancy_type)
        )
        
        serializer = VacancySerializer(vacancies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Authenticated user is injected by JWTMiddleware
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = VacancySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        repo = get_opportunity_repository()
        use_case = CreateVacancyUseCase(repository=repo)

        try:
            vacancy = use_case.execute(
                CreateVacancyInput(
                    title=serializer.validated_data["title"],
                    description=serializer.validated_data["description"],
                    region=serializer.validated_data["region"],
                    culture=serializer.validated_data["culture"],
                    vacancy_type=serializer.validated_data["vacancy_type"],
                    salary=serializer.validated_data["salary"],
                    duration=serializer.validated_data["duration"],
                    expires_at=serializer.validated_data["expires_at"],
                    producer_id=current_user.id,
                    producer_name=current_user.name,
                    producer_role=current_user.role,
                )
            )
            response_serializer = VacancySerializer(vacancy)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response(
                {"detail": "Erro interno ao cadastrar vaga."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ApplyOpportunityView(APIView):
    """
    POST /api/opportunities/<vacancy_id>/apply/ - Apply for a vacancy (Student/Technician only)
    """

    def post(self, request, vacancy_id):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        repo = get_opportunity_repository()
        notifier = NotificationService()
        use_case = ApplyToVacancyUseCase(repository=repo, notification_service=notifier)

        try:
            application = use_case.execute(
                ApplyToVacancyInput(
                    vacancy_id=vacancy_id,
                    user_id=current_user.id,
                    user_name=current_user.name,
                    user_role=current_user.role,
                )
            )
            
            # Enrich serialized output with vacancy details for direct feedback
            vacancy = repo.get_opportunity_by_id(vacancy_id)
            serialized_data = ApplicationSerializer(application).data
            if vacancy:
                serialized_data["vacancy_title"] = vacancy.title
                serialized_data["vacancy_region"] = vacancy.region
                serialized_data["vacancy_culture"] = vacancy.culture

            return Response(serialized_data, status=status.HTTP_201_CREATED)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response(
                {"detail": "Erro interno ao processar candidatura."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ListApplicationsView(APIView):
    """
    GET /api/opportunities/applications/ - View candidate history
    """

    def get(self, request):
        current_user = getattr(request, "current_user", None)
        if not current_user:
            return Response(
                {"detail": "Não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        repo = get_opportunity_repository()
        use_case = GetUserApplicationsUseCase(repository=repo)
        
        applications = use_case.execute(user_id=current_user.id)
        
        # Enriquecer os objetos de candidatura com informações das vagas correspondentes
        enriched_apps = []
        for app in applications:
            vacancy = repo.get_opportunity_by_id(app.opportunity_id)
            enriched_app = {
                "id": app.id,
                "opportunity_id": app.opportunity_id,
                "user_id": app.user_id,
                "user_name": app.user_name,
                "user_role": app.user_role,
                "applied_at": app.applied_at,
                "status": app.status,
                "vacancy_title": vacancy.title if vacancy else "Vaga Removida",
                "vacancy_region": vacancy.region if vacancy else "",
                "vacancy_culture": vacancy.culture if vacancy else "",
            }
            enriched_apps.append(enriched_app)

        serializer = ApplicationSerializer(enriched_apps, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
