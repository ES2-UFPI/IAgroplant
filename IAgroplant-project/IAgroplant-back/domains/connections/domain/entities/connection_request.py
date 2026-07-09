from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class ConnectionRequest:
    id: str
    from_user_id: str
    from_user_name: str
    to_user_id: str
    to_user_name: str
    status: str = "pending"  # 'pending', 'accepted', 'rejected'
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    responded_at: Optional[datetime] = None
