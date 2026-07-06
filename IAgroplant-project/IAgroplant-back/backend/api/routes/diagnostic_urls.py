from django.urls import path

from domains.ai.presentation.controllers.diagnostic_controller import DiagnosticController


urlpatterns = [

    path(

        "",

        DiagnosticController.as_view(),

        name="diagnostic",

    ),

]