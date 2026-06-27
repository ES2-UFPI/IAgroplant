from rest_framework import serializers


class NotifyFeedPostValidator(serializers.Serializer):
    user_id = serializers.CharField()
    post_id = serializers.CharField()
    post_title = serializers.CharField()
    tag = serializers.CharField()