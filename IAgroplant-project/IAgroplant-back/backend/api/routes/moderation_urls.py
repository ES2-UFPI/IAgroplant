from django.urls import path
from domains.moderations.presentation.controllers.moderation_controller import (
    MarkPostVerifiedView,
    RemovePostView,
)

urlpatterns = [
    path(
        "moderation/posts/<str:post_id>/verify",
        MarkPostVerifiedView.as_view(),
        name="moderation-post-verify"
    ),
    path(
        "moderation/posts/<str:post_id>/remove",
        RemovePostView.as_view(),
        name="moderation-post-remove"
    ),
]
