from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


class NotificationType:
    FEED_POST = "FEED_POST"
    CHAT_MESSAGE = "CHAT_MESSAGE"
    OPPORTUNITY = "OPPORTUNITY"
    SYSTEM = "SYSTEM"


@dataclass
class Notification:
    id: str
    user_id: str
    title: str
    body: str
    type: str
    is_read: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = None


@dataclass
class NotificationPreference:
    user_id: str
    type: str
    enabled: bool

    