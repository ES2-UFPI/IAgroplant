from rest_framework import serializers


class DiagnosticValidator(serializers.Serializer):

    image = serializers.ImageField()

    description = serializers.CharField(
        required=False,
        allow_blank=True
    )
    