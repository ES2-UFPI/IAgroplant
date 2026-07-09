from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class ReputationEntry:
    id: str
    user_id: str
    action_type: str
    points: int
    reason: Optional[str] = None
    reference_id: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
