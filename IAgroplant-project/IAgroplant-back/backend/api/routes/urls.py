from django.urls import include, path


urlpatterns = [

    path(
        "auth/",
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
        "diagnostic/",
        include(
            "backend.api.routes.diagnostic_urls"
        )
    ),

]