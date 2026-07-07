import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
from domains.opportunities.domain.entities.vacancy import Vacancy
from domains.opportunities.domain.entities.application import Application
from domains.opportunities.application.use_cases.create_vacancy_use_case import CreateVacancyUseCase, CreateVacancyInput
from domains.opportunities.application.use_cases.search_vacancies_use_case import SearchVacanciesUseCase, SearchFilters
from domains.opportunities.application.use_cases.apply_to_vacancy_use_case import ApplyToVacancyUseCase, ApplyToVacancyInput
from domains.opportunities.application.use_cases.get_user_applications_use_case import GetUserApplicationsUseCase


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_repo():
    repo = MagicMock()
    return repo


@pytest.fixture
def mock_notifier():
    notifier = MagicMock()
    return notifier


@pytest.fixture
def active_vacancy():
    now = datetime.now(timezone.utc)
    return Vacancy(
        id="vaga-ativa-123",
        title="Estagiário de Algodão",
        description="Acompanhamento de lavoura.",
        region="Mato Grosso",
        culture="Algodão",
        vacancy_type="Estágio",
        salary="R$ 1.500,00",
        duration="6 meses",
        producer_id="producer-999",
        producer_name="Fazenda Sol",
        expires_at=now + timedelta(days=10),
        created_at=now - timedelta(days=1),
    )


@pytest.fixture
def expired_vacancy():
    now = datetime.now(timezone.utc)
    return Vacancy(
        id="vaga-expirada-456",
        title="Agrônomo de Café",
        description="Acompanhamento técnico.",
        region="Minas Gerais",
        culture="Café",
        vacancy_type="Emprego",
        salary="R$ 5.000,00",
        duration="CLT",
        producer_id="producer-999",
        producer_name="Fazenda Sol",
        expires_at=now - timedelta(days=2),  # Expired 2 days ago
        created_at=now - timedelta(days=10),
    )


# ─── SearchVacanciesUseCase Tests ───────────────────────────────────────────

class TestSearchVacanciesUseCase:

    def test_search_hides_expired_vacancies(self, mock_repo, active_vacancy, expired_vacancy):
        mock_repo.list_opportunities.return_value = [active_vacancy, expired_vacancy]
        
        use_case = SearchVacanciesUseCase(repository=mock_repo)
        results = use_case.execute(SearchFilters())

        # Expired vacancy (vaga-expirada-456) must be hidden
        assert len(results) == 1
        assert results[0].id == "vaga-ativa-123"

    def test_search_filters_forwarded_correctly(self, mock_repo):
        mock_repo.list_opportunities.return_value = []
        
        use_case = SearchVacanciesUseCase(repository=mock_repo)
        use_case.execute(SearchFilters(region="Bahia", culture="Soja", vacancy_type="Estágio"))
        
        mock_repo.list_opportunities.assert_called_once_with(
            region="Bahia",
            culture="Soja",
            vacancy_type="Estágio"
        )


# ─── CreateVacancyUseCase Tests ─────────────────────────────────────────────

class TestCreateVacancyUseCase:

    def test_create_vacancy_success_as_producer(self, mock_repo):
        mock_repo.save_opportunity.side_effect = lambda x: x
        use_case = CreateVacancyUseCase(repository=mock_repo)
        
        now = datetime.now(timezone.utc)
        input_data = CreateVacancyInput(
            title="Estagiário Soja",
            description="Manejo integrado.",
            region="Goiás",
            culture="Soja",
            vacancy_type="Estágio",
            salary="R$ 2.000",
            duration="1 ano",
            expires_at=now + timedelta(days=5),
            producer_id="prod-1",
            producer_name="Produtor João",
            producer_role="Produtor Rural"  # Allowed role
        )
        
        result = use_case.execute(input_data)
        
        assert result.title == "Estagiário Soja"
        assert result.producer_id == "prod-1"
        mock_repo.save_opportunity.assert_called_once()

    def test_create_vacancy_fails_as_student(self, mock_repo):
        use_case = CreateVacancyUseCase(repository=mock_repo)
        
        now = datetime.now(timezone.utc)
        input_data = CreateVacancyInput(
            title="Estagiário Soja",
            description="Manejo integrado.",
            region="Goiás",
            culture="Soja",
            vacancy_type="Estágio",
            salary="R$ 2.000",
            duration="1 ano",
            expires_at=now + timedelta(days=5),
            producer_id="student-1",
            producer_name="Estudante Carlos",
            producer_role="Estudante"  # Not allowed role
        )
        
        with pytest.raises(PermissionError, match="Somente usuários com perfil Produtor podem cadastrar vagas."):
            use_case.execute(input_data)


# ─── ApplyToVacancyUseCase Tests ────────────────────────────────────────────

class TestApplyToVacancyUseCase:

    def test_apply_success_as_student(self, mock_repo, mock_notifier, active_vacancy):
        mock_repo.get_opportunity_by_id.return_value = active_vacancy
        mock_repo.get_applications_by_user.return_value = []
        mock_repo.save_application.side_effect = lambda x: x
        
        use_case = ApplyToVacancyUseCase(repository=mock_repo, notification_service=mock_notifier)
        
        input_data = ApplyToVacancyInput(
            vacancy_id="vaga-ativa-123",
            user_id="student-456",
            user_name="Estudante Pedro",
            user_role="Estudante"  # Allowed
        )
        
        result = use_case.execute(input_data)
        
        assert result.opportunity_id == "vaga-ativa-123"
        assert result.user_id == "student-456"
        assert result.status == "Pendente"
        
        # Verify notification published
        mock_notifier.send_push_notification.assert_called_once()

    def test_apply_fails_as_producer(self, mock_repo, mock_notifier, active_vacancy):
        use_case = ApplyToVacancyUseCase(repository=mock_repo, notification_service=mock_notifier)
        
        input_data = ApplyToVacancyInput(
            vacancy_id="vaga-ativa-123",
            user_id="prod-1",
            user_name="Produtor João",
            user_role="Produtor Rural"  # Not allowed
        )
        
        with pytest.raises(PermissionError, match="Somente usuários com perfil Estudante ou Técnico podem se candidatar."):
            use_case.execute(input_data)

    def test_apply_fails_on_expired_vacancy(self, mock_repo, mock_notifier, expired_vacancy):
        mock_repo.get_opportunity_by_id.return_value = expired_vacancy
        mock_repo.get_applications_by_user.return_value = []
        
        use_case = ApplyToVacancyUseCase(repository=mock_repo, notification_service=mock_notifier)
        
        input_data = ApplyToVacancyInput(
            vacancy_id="vaga-expirada-456",
            user_id="student-456",
            user_name="Estudante Pedro",
            user_role="Estudante"
        )
        
        with pytest.raises(ValueError, match="Esta vaga já expirou e não aceita mais candidaturas."):
            use_case.execute(input_data)

    def test_apply_prevent_duplicate_applications(self, mock_repo, mock_notifier, active_vacancy):
        mock_repo.get_opportunity_by_id.return_value = active_vacancy
        
        existing_app = Application(
            id="app-1",
            opportunity_id="vaga-ativa-123",
            user_id="student-456",
            user_name="Estudante Pedro",
            user_role="Estudante",
            applied_at=datetime.now(timezone.utc)
        )
        mock_repo.get_applications_by_user.return_value = [existing_app]
        
        use_case = ApplyToVacancyUseCase(repository=mock_repo, notification_service=mock_notifier)
        
        input_data = ApplyToVacancyInput(
            vacancy_id="vaga-ativa-123",
            user_id="student-456",
            user_name="Estudante Pedro",
            user_role="Estudante"
        )
        
        with pytest.raises(ValueError, match="Você já se candidatou a esta vaga."):
            use_case.execute(input_data)


# ─── GetUserApplicationsUseCase Tests ───────────────────────────────────────

class TestGetUserApplicationsUseCase:

    def test_get_user_applications_success(self, mock_repo):
        app1 = Application(id="app-1", opportunity_id="v-1", user_id="student-456", user_name="P", user_role="Estudante", applied_at=datetime.now())
        app2 = Application(id="app-2", opportunity_id="v-2", user_id="student-456", user_name="P", user_role="Estudante", applied_at=datetime.now())
        mock_repo.get_applications_by_user.return_value = [app1, app2]
        
        use_case = GetUserApplicationsUseCase(repository=mock_repo)
        results = use_case.execute("student-456")
        
        assert len(results) == 2
        mock_repo.get_applications_by_user.assert_called_once_with("student-456")
        assert results[0].id == "app-1"
