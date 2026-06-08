from rest_framework import serializers


class LoginValidator(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)


class RefreshValidator(serializers.Serializer):
    refresh_token = serializers.CharField()
