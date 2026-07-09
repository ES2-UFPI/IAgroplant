import pytest
from unittest.mock import MagicMock
from domains.reputation.application.use_cases.mark_chat_reply_useful_use_case import (
    MarkChatReplyUsefulUseCase,
    MarkChatReplyUsefulInput,
)


@pytest.fixture
def mock_reputation_repo():
    repo = MagicMock()
    repo.has_entry_reference.return_value = False
    repo.add_entry.side_effect = lambda e: e
    return repo


class TestMarkChatReplyUsefulUseCase:

    def test_awards_recipient(self, mock_reputation_repo):
        use_case = MarkChatReplyUsefulUseCase(repository=mock_reputation_repo)
        entry = use_case.execute(
            MarkChatReplyUsefulInput(
                marking_user_id="user-1", recipient_user_id="user-2", message_id="msg-1"
            )
        )

        assert entry.user_id == "user-2"
        assert entry.points == 5

    def test_blocks_self_marking(self, mock_reputation_repo):
        use_case = MarkChatReplyUsefulUseCase(repository=mock_reputation_repo)

        with pytest.raises(ValueError, match="própria mensagem"):
            use_case.execute(
                MarkChatReplyUsefulInput(
                    marking_user_id="user-1", recipient_user_id="user-1", message_id="msg-1"
                )
            )

    def test_blocks_duplicate_message_marking(self, mock_reputation_repo):
        mock_reputation_repo.has_entry_reference.return_value = True

        use_case = MarkChatReplyUsefulUseCase(repository=mock_reputation_repo)

        with pytest.raises(ValueError, match="já concedeu pontos"):
            use_case.execute(
                MarkChatReplyUsefulInput(
                    marking_user_id="user-1", recipient_user_id="user-2", message_id="msg-1"
                )
            )
