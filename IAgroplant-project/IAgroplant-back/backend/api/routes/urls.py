from django.urls import include, path

urlpatterns = [

    path(
        "",
        include(
            "backend.api.routes.auth_urls"
        )
    ),

]