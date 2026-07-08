from integrations.database.supabase_client import get_supabase_client

# Import User repositories
from domains.users.domain.repositories.user_repository import UserRepository
from domains.users.infrastructure.persistence.postgres_user_repository import PostgresUserRepository
from domains.users.infrastructure.persistence.supabase_user_repository import SupabaseUserRepository

# Import Opportunity repositories
from domains.opportunities.domain.repositories.opportunity_repository import OpportunityRepository
from domains.opportunities.infrastructure.persistence.postgres_opportunity_repository import PostgresOpportunityRepository
from domains.opportunities.infrastructure.persistence.supabase_opportunity_repository import SupabaseOpportunityRepository

# Import Notification repositories
from domains.notifications.domain.repositories.notification_repository import NotificationRepository
from domains.notifications.infrastructure.persistence.postgres_notification_repository import PostgresNotificationRepository
from domains.notifications.infrastructure.persistence.supabase_notification_repository import SupabaseNotificationRepository

# Import Auth repositories
from domains.auth.domain.repositories.auth_repository import AuthRepository
from domains.auth.infrastructure.persistence.postgres_auth_repository import PostgresAuthRepository
from domains.auth.infrastructure.persistence.supabase_auth_repository import SupabaseAuthRepository

# Import Post repositories
from domains.posts.domain.repositories.post_repository import PostRepository
from domains.posts.infrastructure.persistence.postgres_post_repository import PostgresPostRepository
from domains.posts.infrastructure.persistence.supabase_post_repository import SupabasePostRepository


_user_repo_instance = None
_opportunity_repo_instance = None
_notification_repo_instance = None
_auth_repo_instance = None
_post_repo_instance = None



def get_user_repository() -> UserRepository:
    global _user_repo_instance
    if _user_repo_instance is not None:
        return _user_repo_instance

    client = get_supabase_client()
    if client is not None:
        _user_repo_instance = SupabaseUserRepository(client)
    else:
        _user_repo_instance = PostgresUserRepository()
    return _user_repo_instance


def get_opportunity_repository() -> OpportunityRepository:
    global _opportunity_repo_instance
    if _opportunity_repo_instance is not None:
        return _opportunity_repo_instance

    client = get_supabase_client()
    if client is not None:
        _opportunity_repo_instance = SupabaseOpportunityRepository(client)
    else:
        _opportunity_repo_instance = PostgresOpportunityRepository()
    return _opportunity_repo_instance


def get_notification_repository() -> NotificationRepository:
    global _notification_repo_instance
    if _notification_repo_instance is not None:
        return _notification_repo_instance

    client = get_supabase_client()
    if client is not None:
        _notification_repo_instance = SupabaseNotificationRepository(client)
    else:
        _notification_repo_instance = PostgresNotificationRepository()
    return _notification_repo_instance


def get_auth_repository() -> AuthRepository:
    global _auth_repo_instance
    if _auth_repo_instance is not None:
        return _auth_repo_instance

    client = get_supabase_client()
    if client is not None:
        _auth_repo_instance = SupabaseAuthRepository(client)
    else:
        _auth_repo_instance = PostgresAuthRepository()
    return _auth_repo_instance


def get_post_repository() -> PostRepository:
    global _post_repo_instance
    if _post_repo_instance is not None:
        return _post_repo_instance

    client = get_supabase_client()
    if client is not None:
        _post_repo_instance = SupabasePostRepository(client)
    else:
        _post_repo_instance = PostgresPostRepository()
    return _post_repo_instance

