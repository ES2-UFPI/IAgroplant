from rest_framework import serializers


class NotifyChatMessageValidator(serializers.Serializer):
    sender_name = serializers.CharField()
    message_preview = serializers.CharField()
    chat_id = serializers.CharField()