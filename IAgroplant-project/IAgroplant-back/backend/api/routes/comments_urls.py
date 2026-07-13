from django.urls import path
from domains.comments.presentation.controllers.comments_controller import (
    ListCreateCommentsView,
)

urlpatterns = [
    path(
        "posts/<str:post_id>/comments",
        ListCreateCommentsView.as_view(),
        name="posts-comments"
    ),
]
