from django.urls import path
from domains.posts.presentation.controllers.posts_controller import (
    ListCreatePostsView,
    LikePostView,
    UnlikePostView,
)

urlpatterns = [
    path(
        "posts",
        ListCreatePostsView.as_view(),
        name="posts-list-create"
    ),
    path(
        "posts/<str:post_id>/like",
        LikePostView.as_view(),
        name="posts-like"
    ),
    path(
        "posts/<str:post_id>/unlike",
        UnlikePostView.as_view(),
        name="posts-unlike"
    ),
]
