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
        "",
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

]