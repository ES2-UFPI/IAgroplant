from django.urls import path
from domains.reputation.presentation.controllers.chat_reputation_controller import (
    MarkChatReplyUsefulView,
)

urlpatterns = [
    path(
        "chat/mark-useful",
        MarkChatReplyUsefulView.as_view(),
        name="chat-mark-useful"
    ),
]
