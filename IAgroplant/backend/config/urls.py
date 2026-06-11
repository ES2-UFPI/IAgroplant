from django.urls import include, path

urlpatterns = [
    path(
        "api/",
        include("backend.api.routes.urls")
    ),
]