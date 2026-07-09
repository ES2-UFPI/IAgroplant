import pytest
from unittest.mock import MagicMock, call
from datetime import datetime

from domains.notifications.domain.entities.notification import (
    Notification,
    NotificationPreference,
    NotificationType,
)
from domains.notifications.application.use_cases.get_user_notifications_use_case import (
    GetUserNotificationsUseCase,
    GetUserNotificationsInput,
)
from domains.notifications.application.use_cases.mark_notification_read_use_case import (
    MarkNotificationReadUseCase,
    MarkNotificationReadInput,
)
from domains.notifications.application.use_cases.get_notification_preferences_use_case import (
    GetNotificationPreferencesUseCase,
    GetNotificationPreferencesInput,
)
from domains.notifications.application.use_cases.update_notification_preferences_use_case import (
    UpdateNotificationPreferencesUseCase,
    UpdateNotificationPreferencesInput,
)
from domains.notifications.infrastructure.persistence.postgres_notification_repository import (
    PostgresNotificationRepository,
)


# ═══════════════════════════════════════════════════════════════════════════════
# FIXTURES COMPARTILHADAS
# ═══════════════════════════════════════════════════════════════════════════════

@pytest.fixture
def notif_feed():
    return Notification(
        id="notif-001",
        user_id="user-123",
        title="Nova postagem na sua tag seguida",
        body="Um novo post sobre 'milho' foi publicado: Como plantar milho",
        type=NotificationType.FEED_POST,
        metadata={"post_id": "post-456", "tag": "milho"},
    )


@pytest.fixture
def notif_chat():
    return Notification(
        id="notif-002",
        user_id="user-123",
        title="Nova mensagem de João",
        body="Oi, tudo bem?",
        type=NotificationType.CHAT_MESSAGE,
        metadata={"chat_id": "chat-789", "sender_name": "João"},
    )


@pytest.fixture
def notif_opportunity():
    return Notification(
        id="notif-003",
        user_id="user-123",
        title="Nova oportunidade disponível!",
        body="'Estágio em Agronomia' em Teresina - PI",
        type=NotificationType.OPPORTUNITY,
        metadata={"opportunity_id": "opp-001", "location": "Teresina - PI"},
    )


@pytest.fixture
def notif_system():
    return Notification(
        id="notif-004",
        user_id="user-123",
        title="Bem-vindo ao IAgroplant!",
        body="Sua conta foi criada com sucesso.",
        type=NotificationType.SYSTEM,
        metadata=None,
    )


@pytest.fixture
def todas_notificacoes(notif_feed, notif_chat, notif_opportunity, notif_system):
    return [notif_feed, notif_chat, notif_opportunity, notif_system]


@pytest.fixture
def preferencias_padrao():
    return [
        NotificationPreference(user_id="user-123", type="FEED_POST", enabled=True),
        NotificationPreference(user_id="user-123", type="CHAT_MESSAGE", enabled=True),
        NotificationPreference(user_id="user-123", type="OPPORTUNITY", enabled=True),
        NotificationPreference(user_id="user-123", type="SYSTEM", enabled=False),
    ]


@pytest.fixture
def mock_repo(notif_feed, preferencias_padrao):
    repo = MagicMock()
    repo.create.return_value = notif_feed
    repo.find_by_user_id.return_value = [notif_feed]
    repo.mark_as_read.return_value = True
    repo.get_preferences.return_value = preferencias_padrao
    repo.update_preferences.return_value = preferencias_padrao
    return repo


# ═══════════════════════════════════════════════════════════════════════════════
# TESTES — GetUserNotificationsUseCase
# ═══════════════════════════════════════════════════════════════════════════════

class TestGetUserNotificationsUseCase:
    """Testa a busca de notificações do usuário autenticado."""

    def test_retorna_notificacoes_do_usuario(self, mock_repo):
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        assert len(result.notifications) == 1

    def test_chama_repositorio_com_user_id_correto(self, mock_repo):
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        mock_repo.find_by_user_id.assert_called_once_with("user-123")

    def test_retorna_lista_vazia_quando_sem_notificacoes(self, mock_repo):
        mock_repo.find_by_user_id.return_value = []
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-999"))

        assert result.notifications == []

    def test_retorna_multiplas_notificacoes(self, mock_repo, todas_notificacoes):
        mock_repo.find_by_user_id.return_value = todas_notificacoes
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        assert len(result.notifications) == 4

    def test_notificacao_retornada_tem_tipo_correto(self, mock_repo):
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        assert result.notifications[0].type == NotificationType.FEED_POST

    def test_notificacao_retornada_tem_user_id_correto(self, mock_repo):
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        assert result.notifications[0].user_id == "user-123"

    def test_notificacao_nao_lida_por_padrao(self, mock_repo):
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        assert result.notifications[0].is_read is False

    def test_retorna_todos_os_tipos_de_notificacao(self, mock_repo, todas_notificacoes):
        mock_repo.find_by_user_id.return_value = todas_notificacoes
        use_case = GetUserNotificationsUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetUserNotificationsInput(user_id="user-123"))

        tipos = {n.type for n in result.notifications}
        assert NotificationType.FEED_POST in tipos
        assert NotificationType.CHAT_MESSAGE in tipos
        assert NotificationType.OPPORTUNITY in tipos
        assert NotificationType.SYSTEM in tipos


# ═══════════════════════════════════════════════════════════════════════════════
# TESTES — MarkNotificationReadUseCase
# ═══════════════════════════════════════════════════════════════════════════════

class TestMarkNotificationReadUseCase:
    """Testa a marcação de notificação como lida."""

    def test_marca_notificacao_como_lida(self, mock_repo):
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        result = use_case.execute(MarkNotificationReadInput(notification_id="notif-001"))

        assert result.success is True

    def test_chama_repositorio_com_id_correto(self, mock_repo):
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        use_case.execute(MarkNotificationReadInput(notification_id="notif-001"))

        mock_repo.mark_as_read.assert_called_once_with("notif-001")

    def test_retorna_false_quando_notificacao_nao_encontrada(self, mock_repo):
        mock_repo.mark_as_read.return_value = False
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        result = use_case.execute(MarkNotificationReadInput(notification_id="notif-999"))

        assert result.success is False

    def test_resultado_e_booleano(self, mock_repo):
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)
        result = use_case.execute(MarkNotificationReadInput(notification_id="notif-001"))

        assert isinstance(result.success, bool)

    def test_marca_multiplas_notificacoes_sequencialmente(self, mock_repo):
        use_case = MarkNotificationReadUseCase(notification_repository=mock_repo)

        result1 = use_case.execute(MarkNotificationReadInput(notification_id="notif-001"))
        result2 = use_case.execute(MarkNotificationReadInput(notification_id="notif-002"))

        assert result1.success is True
        assert result2.success is True
        assert mock_repo.mark_as_read.call_count == 2


# ═══════════════════════════════════════════════════════════════════════════════
# TESTES — GetNotificationPreferencesUseCase
# ═══════════════════════════════════════════════════════════════════════════════

class TestGetNotificationPreferencesUseCase:
    """Testa a busca das preferências de notificação do usuário."""

    def test_retorna_4_preferencias_por_padrao(self, mock_repo):
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetNotificationPreferencesInput(user_id="user-123"))

        assert len(result.preferences) == 4

    def test_chama_repositorio_com_user_id_correto(self, mock_repo):
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        use_case.execute(GetNotificationPreferencesInput(user_id="user-123"))

        mock_repo.get_preferences.assert_called_once_with("user-123")

    def test_preferencia_feed_post_ativada(self, mock_repo):
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetNotificationPreferencesInput(user_id="user-123"))

        feed_pref = next(p for p in result.preferences if p.type == "FEED_POST")
        assert feed_pref.enabled is True

    def test_preferencia_chat_ativada(self, mock_repo):
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetNotificationPreferencesInput(user_id="user-123"))

        chat_pref = next(p for p in result.preferences if p.type == "CHAT_MESSAGE")
        assert chat_pref.enabled is True

    def test_preferencia_opportunity_ativada(self, mock_repo):
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetNotificationPreferencesInput(user_id="user-123"))

        opp_pref = next(p for p in result.preferences if p.type == "OPPORTUNITY")
        assert opp_pref.enabled is True

    def test_preferencia_system_desativada(self, mock_repo):
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetNotificationPreferencesInput(user_id="user-123"))

        system_pref = next(p for p in result.preferences if p.type == "SYSTEM")
        assert system_pref.enabled is False

    def test_preferencias_pertencem_ao_usuario_correto(self, mock_repo):
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetNotificationPreferencesInput(user_id="user-123"))

        for pref in result.preferences:
            assert pref.user_id == "user-123"

    def test_retorna_lista_vazia_quando_sem_preferencias(self, mock_repo):
        mock_repo.get_preferences.return_value = []
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetNotificationPreferencesInput(user_id="user-999"))

        assert result.preferences == []


# ═══════════════════════════════════════════════════════════════════════════════
# TESTES — UpdateNotificationPreferencesUseCase
# ═══════════════════════════════════════════════════════════════════════════════

class TestUpdateNotificationPreferencesUseCase:
    """Testa a atualização das preferências de notificação do usuário."""

    def test_atualiza_preferencias_com_sucesso(self, mock_repo, preferencias_padrao):
        use_case = UpdateNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(UpdateNotificationPreferencesInput(
            user_id="user-123",
            preferences=preferencias_padrao,
        ))

        assert len(result.preferences) == 4

    def test_chama_repositorio_com_dados_corretos(self, mock_repo, preferencias_padrao):
        use_case = UpdateNotificationPreferencesUseCase(notification_repository=mock_repo)
        use_case.execute(UpdateNotificationPreferencesInput(
            user_id="user-123",
            preferences=preferencias_padrao,
        ))

        mock_repo.update_preferences.assert_called_once_with("user-123", preferencias_padrao)

    def test_desativa_preferencia_feed(self, mock_repo):
        updated = [NotificationPreference(user_id="user-123", type="FEED_POST", enabled=False)]
        mock_repo.update_preferences.return_value = updated

        use_case = UpdateNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(UpdateNotificationPreferencesInput(
            user_id="user-123",
            preferences=updated,
        ))

        assert result.preferences[0].enabled is False
        assert result.preferences[0].type == "FEED_POST"

    def test_desativa_preferencia_chat(self, mock_repo):
        updated = [NotificationPreference(user_id="user-123", type="CHAT_MESSAGE", enabled=False)]
        mock_repo.update_preferences.return_value = updated

        use_case = UpdateNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(UpdateNotificationPreferencesInput(
            user_id="user-123",
            preferences=updated,
        ))

        assert result.preferences[0].enabled is False

    def test_ativa_preferencia_system(self, mock_repo):
        updated = [NotificationPreference(user_id="user-123", type="SYSTEM", enabled=True)]
        mock_repo.update_preferences.return_value = updated

        use_case = UpdateNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(UpdateNotificationPreferencesInput(
            user_id="user-123",
            preferences=updated,
        ))

        assert result.preferences[0].enabled is True
        assert result.preferences[0].type == "SYSTEM"

    def test_atualiza_todas_preferencias_de_uma_vez(self, mock_repo):
        todas_desativadas = [
            NotificationPreference(user_id="user-123", type="FEED_POST", enabled=False),
            NotificationPreference(user_id="user-123", type="CHAT_MESSAGE", enabled=False),
            NotificationPreference(user_id="user-123", type="OPPORTUNITY", enabled=False),
            NotificationPreference(user_id="user-123", type="SYSTEM", enabled=False),
        ]
        mock_repo.update_preferences.return_value = todas_desativadas

        use_case = UpdateNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(UpdateNotificationPreferencesInput(
            user_id="user-123",
            preferences=todas_desativadas,
        ))

        assert all(p.enabled is False for p in result.preferences)


# ═══════════════════════════════════════════════════════════════════════════════
# TESTES — PostgresNotificationRepository (implementação concreta)
# ═══════════════════════════════════════════════════════════════════════════════

class TestPostgresNotificationRepository:
    """Testa o comportamento atual do repositório concreto (com TODOs)."""

    def test_create_retorna_a_propria_notificacao(self, notif_feed):
        repo = PostgresNotificationRepository()
        result = repo.create(notif_feed)

        assert result == notif_feed

    def test_find_by_user_id_retorna_lista_vazia(self):
        repo = PostgresNotificationRepository()
        result = repo.find_by_user_id("user-123")

        assert result == []

    def test_mark_as_read_retorna_true(self):
        repo = PostgresNotificationRepository()
        result = repo.mark_as_read("notif-001")

        assert result is True

    def test_get_preferences_retorna_4_preferencias(self):
        repo = PostgresNotificationRepository()
        result = repo.get_preferences("user-123")

        assert len(result) == 4

    def test_get_preferences_todos_tipos_presentes(self):
        repo = PostgresNotificationRepository()
        result = repo.get_preferences("user-123")

        tipos = {p.type for p in result}
        assert "FEED_POST" in tipos
        assert "CHAT_MESSAGE" in tipos
        assert "OPPORTUNITY" in tipos
        assert "SYSTEM" in tipos

    def test_get_preferences_pertence_ao_usuario(self):
        repo = PostgresNotificationRepository()
        result = repo.get_preferences("user-456")

        for pref in result:
            assert pref.user_id == "user-456"

    def test_update_preferences_retorna_as_mesmas_preferencias(self, preferencias_padrao):
        repo = PostgresNotificationRepository()
        result = repo.update_preferences("user-123", preferencias_padrao)

        assert result == preferencias_padrao


# ═══════════════════════════════════════════════════════════════════════════════
# TESTES — Entidade Notification
# ═══════════════════════════════════════════════════════════════════════════════

class TestNotificationEntity:
    """Testa a entidade de domínio Notification."""

    def test_notificacao_criada_com_campos_corretos(self):
        notif = Notification(
            id="notif-001",
            user_id="user-123",
            title="Teste",
            body="Corpo do teste",
            type=NotificationType.FEED_POST,
        )

        assert notif.id == "notif-001"
        assert notif.user_id == "user-123"
        assert notif.title == "Teste"
        assert notif.body == "Corpo do teste"
        assert notif.type == NotificationType.FEED_POST

    def test_notificacao_nao_lida_por_padrao(self):
        notif = Notification(
            id="notif-001",
            user_id="user-123",
            title="Teste",
            body="Corpo",
            type=NotificationType.SYSTEM,
        )

        assert notif.is_read is False

    def test_notificacao_metadata_none_por_padrao(self):
        notif = Notification(
            id="notif-001",
            user_id="user-123",
            title="Teste",
            body="Corpo",
            type=NotificationType.SYSTEM,
        )

        assert notif.metadata is None

    def test_notificacao_created_at_preenchido_automaticamente(self):
        notif = Notification(
            id="notif-001",
            user_id="user-123",
            title="Teste",
            body="Corpo",
            type=NotificationType.SYSTEM,
        )

        assert isinstance(notif.created_at, datetime)

    def test_tipos_de_notificacao_existem(self):
        assert NotificationType.FEED_POST == "FEED_POST"
        assert NotificationType.CHAT_MESSAGE == "CHAT_MESSAGE"
        assert NotificationType.OPPORTUNITY == "OPPORTUNITY"
        assert NotificationType.SYSTEM == "SYSTEM"


# ═══════════════════════════════════════════════════════════════════════════════
# TESTES — Entidade NotificationPreference
# ═══════════════════════════════════════════════════════════════════════════════

class TestNotificationPreferenceEntity:
    """Testa a entidade de domínio NotificationPreference."""

    def test_preferencia_ativada_por_padrao(self):
        pref = NotificationPreference(user_id="user-123", type="FEED_POST")

        assert pref.enabled is True

    def test_preferencia_pode_ser_desativada(self):
        pref = NotificationPreference(user_id="user-123", type="FEED_POST", enabled=False)

        assert pref.enabled is False

    def test_preferencia_tem_user_id_correto(self):
        pref = NotificationPreference(user_id="user-456", type="CHAT_MESSAGE")

        assert pref.user_id == "user-456"

    def test_preferencia_tem_type_correto(self):
        pref = NotificationPreference(user_id="user-123", type="OPPORTUNITY")

        assert pref.type == "OPPORTUNITY"
