import jwt
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from decouple import config


SECRET_KEY = config("JWT_SECRET_KEY")
ALGORITHM = config("JWT_ALGORITHM", default="HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(config("ACCESS_TOKEN_EXPIRE_MINUTES", default=15))
REFRESH_TOKEN_EXPIRE_DAYS = int(config("REFRESH_TOKEN_EXPIRE_DAYS", default=7))


class TokenService:

    @staticmethod
    def generate_access_token(user_id: str, email: str, role: str) -> str:
        payload = {
            "sub": user_id,
            "email": email,
            "role": role,
            "type": "access",
            "jti": str(uuid.uuid4()),
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def generate_refresh_token(user_id: str) -> str:
        payload = {
            "sub": user_id,
            "type": "refresh",
            "jti": str(uuid.uuid4()),
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token expirado.")
        except jwt.InvalidTokenError:
            raise ValueError("Token inválido.")

    @staticmethod
    def is_access_token(payload: dict) -> bool:
        return payload.get("type") == "access"

    @staticmethod
    def is_refresh_token(payload: dict) -> bool:
        return payload.get("type") == "refresh"
