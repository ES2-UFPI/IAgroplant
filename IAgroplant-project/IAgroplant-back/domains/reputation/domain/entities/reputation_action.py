from typing import Dict

# Tipos de ação reconhecidos pelo motor de reputação.
POST_VERIFIED = "post_verified"
DIAGNOSIS_CONFIRMED = "diagnosis_confirmed"
CHAT_REPLY_USEFUL = "chat_reply_useful"
CONNECTION_ACCEPTED = "connection_accepted"
POST_REMOVED_VIOLATION = "post_removed_violation"

# Tabela de pontos por ação — fonte única de verdade dos valores do produto.
POINTS_TABLE: Dict[str, int] = {
    POST_VERIFIED: 10,
    DIAGNOSIS_CONFIRMED: 15,
    CHAT_REPLY_USEFUL: 5,
    CONNECTION_ACCEPTED: 3,
    POST_REMOVED_VIOLATION: -20,
}
