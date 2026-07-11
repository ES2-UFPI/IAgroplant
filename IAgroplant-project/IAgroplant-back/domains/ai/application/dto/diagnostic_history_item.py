from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class DiagnosticHistoryItem:

    id: str

    pathogen: str

    severity: str

    management: str

    technical_warning: str

    confirmed: bool

    confirmed_by: Optional[str]

    confirmed_at: Optional[datetime]

    created_at: datetime