from rest_framework import serializers


class NotifyNewOpportunityValidator(serializers.Serializer):
    opportunity_id = serializers.CharField()
    opportunity_title = serializers.CharField()
    location = serializers.CharField()