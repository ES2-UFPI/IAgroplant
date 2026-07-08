from supabase import create_client, Client
from decouple import config, UndefinedValueError
import logging

logger = logging.getLogger(__name__)

_supabase_client = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    try:
        url = config("SUPABASE_URL", default="")
        key = config("SUPABASE_SERVICE_ROLE_KEY", default="")
        
        # Check if the keys are placeholders or empty
        if not url or not key or "xxxx" in url or "sua-service-role-key" in key:
            logger.warning("Supabase credentials not configured or using placeholders. Falling back to local mock data.")
            return None
            
        _supabase_client = create_client(url, key)
        return _supabase_client
    except (UndefinedValueError, Exception) as e:
        logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to local mock data.")
        return None
