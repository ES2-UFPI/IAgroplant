from rest_framework import serializers


class NotificationPreferenceItemValidator(serializers.Serializer):
    type = serializers.ChoiceField(choices=[
        "FEED_POST",
        "CHAT_MESSAGE",
        "OPPORTUNITY",
        "SYSTEM",
    ])
    enabled = serializers.BooleanField()


class UpdateNotificationPreferencesValidator(serializers.Serializer):
    preferences = NotificationPreferenceItemValidator(many=True)