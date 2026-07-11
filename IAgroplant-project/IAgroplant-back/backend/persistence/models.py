from django.db import models


class DiagnosticRecordModel(models.Model):

    id = models.CharField(
        max_length=36,
        primary_key=True,
    )

    user_id = models.CharField(
        max_length=36,
    )

    pathogen = models.CharField(
        max_length=255,
    )

    severity = models.CharField(
        max_length=50,
    )

    management = models.TextField()

    technical_warning = models.TextField()

    confirmed = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        db_table = "diagnostic_records"

        ordering = [
            "-created_at",
        ]

    def __str__(self):

        return f"{self.pathogen} ({self.severity})"