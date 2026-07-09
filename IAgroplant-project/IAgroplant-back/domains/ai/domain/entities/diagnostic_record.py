from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class DiagnosticRecord:
    id: str
    user_id: str
    pathogen: str
    severity: str
    management: str
    technical_warning: str
    confirmed: bool = False
    confirmed_by: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
