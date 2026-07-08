import pytest
from unittest.mock import MagicMock
from domains.notifications.domain.entities.notification import NotificationPreference, NotificationType
from domains.notifications.application.use_cases.get_notification_preferences_use_case import (
    GetNotificationPreferencesUseCase,
    GetNotificationPreferencesInput,
)
from domains.notifications.application.use_cases.update_notification_preferences_use_case import (
    UpdateNotificationPreferencesUseCase,
    UpdateNotificationPreferencesInput,
)


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_preferences():
    return [
        NotificationPreference(user_id="user-123", type="FEED_POST", enabled=True),
        NotificationPreference(user_id="user-123", type="CHAT_MESSAGE", enabled=True),
        NotificationPreference(user_id="user-123", type="OPPORTUNITY", enabled=True),
        NotificationPreference(user_id="user-123", type="SYSTEM", enabled=False),
    ]


@pytest.fixture
def mock_repo(mock_preferences):
    repo = MagicMock()
    repo.get_preferences.return_value = mock_preferences
    repo.update_preferences.return_value = mock_preferences
    return repo


# ─── GetNotificationPreferencesUseCase ───────────────────────────────────────

class TestGetNotificationPreferencesUseCase:

    def test_retorna_preferencias_do_usuario(self, mock_repo):
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetNotificationPreferencesInput(user_id="user-123"))

        assert len(result.preferences) == 4

    def test_preferencia_system_desativada(self, mock_repo):
        use_case = GetNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(GetNotificationPreferencesInput(user_id="user-123"))

        system_pref = next(p for p in result.preferences if p.type == "SYSTEM")
        assert system_pref.enabled is False


# ─── UpdateNotificationPreferencesUseCase ────────────────────────────────────

class TestUpdateNotificationPreferencesUseCase:

    def test_atualiza_preferencias(self, mock_repo, mock_preferences):
        use_case = UpdateNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(UpdateNotificationPreferencesInput(
            user_id="user-123",
            preferences=mock_preferences,
        ))

        assert len(result.preferences) == 4

    def test_desativa_preferencia_feed(self, mock_repo):
        updated = [
            NotificationPreference(user_id="user-123", type="FEED_POST", enabled=False),
        ]
        mock_repo.update_preferences.return_value = updated
        use_case = UpdateNotificationPreferencesUseCase(notification_repository=mock_repo)
        result = use_case.execute(UpdateNotificationPreferencesInput(
            user_id="user-123",
            preferences=updated,
        ))

        assert result.preferences[0].enabled is False
        assert result.preferences[0].type == "FEED_POST"