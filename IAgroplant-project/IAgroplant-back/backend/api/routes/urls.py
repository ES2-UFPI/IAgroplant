# pyrefly: ignore [missing-import]
from django.urls import include, path


urlpatterns = [

    path(
        "",
        include(
            "backend.api.routes.auth_urls"
        )
    ),

    path(
        "opportunities/",
        include(
            "backend.api.routes.notification_urls"
        )
    ),

    path(
        "",
        include(
            "backend.api.routes.opportunities_urls"
        )
    ),

    path(
        "",
        include(
            "backend.api.routes.posts_urls"
        )
    ),

    path(
        "",
        include(
            "backend.api.routes.users_urls"
        )
    ),

    path(
        "diagnostic/",
        include(
            "backend.api.routes.diagnostic_urls"
        )
    ),

    path(
        "",
        include(
            "backend.api.routes.reputation_urls"
        )
    ),

    path(
        "",
        include(
            "backend.api.routes.moderation_urls"
        )
    ),

    path(
        "",
        include(
            "backend.api.routes.connections_urls"
        )
    ),

    path(
        "",
        include(
            "backend.api.routes.chat_urls"
        )
    ),

    path(
        "",
        include(
            "backend.api.routes.diagnostics_history_urls"
        )
    ),

]