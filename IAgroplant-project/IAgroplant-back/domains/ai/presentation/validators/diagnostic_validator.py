from rest_framework import serializers


class DiagnosticValidator(serializers.Serializer):

    image = serializers.ImageField()

    description = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
    )