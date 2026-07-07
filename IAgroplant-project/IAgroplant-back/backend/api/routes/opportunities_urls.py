from django.urls import path
from domains.opportunities.presentation.controllers.opportunities_controller import (
    ListCreateOpportunitiesView,
    ApplyOpportunityView,
    ListApplicationsView,
)

urlpatterns = [
    path(
        "opportunities",
        ListCreateOpportunitiesView.as_view(),
        name="opportunities-list-create"
    ),
    path(
        "opportunities/<str:vacancy_id>/apply",
        ApplyOpportunityView.as_view(),
        name="opportunities-apply"
    ),
    path(
        "opportunities/applications",
        ListApplicationsView.as_view(),
        name="opportunities-applications"
    ),
]
