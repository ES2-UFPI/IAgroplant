from dataclasses import dataclass
from datetime import datetime


@dataclass
class Application:
    id: str
    opportunity_id: str
    user_id: str
    user_name: str
    user_role: str  # 'Estudante' ou 'Técnico'
    applied_at: datetime
    status: str = "Pendente"
