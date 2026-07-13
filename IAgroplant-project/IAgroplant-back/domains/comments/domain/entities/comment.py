from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Comment:
    id: str
    post_id: str
    author_id: str
    author_name: str
    author_role: str
    author_initials: str
    content: str
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
