from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional


@dataclass
class Vacancy:
    id: str
    title: str
    description: str
    region: str
    culture: str
    vacancy_type: str  # 'Estágio', 'Emprego', 'Freelance'
    salary: str
    duration: str
    producer_id: str
    producer_name: str
    expires_at: datetime
    created_at: datetime

    def is_expired(self) -> bool:
        now = datetime.now(timezone.utc) if self.expires_at.tzinfo else datetime.now()
        return now > self.expires_at
