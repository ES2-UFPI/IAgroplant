from django.test import TestCase
from rest_framework.test import APIClient


class DiagnosticHistoryIntegrationTest(TestCase):

    def setUp(self):

        self.client = APIClient()

    def test_history_endpoint_exists(self):

        response = self.client.get(

            "/api/diagnostics/me"

        )

        self.assertNotEqual(

            response.status_code,

            404,

        )

    def test_pending_endpoint_exists(self):

        response = self.client.get(

            "/api/diagnostics/pending"

        )

        self.assertNotEqual(

            response.status_code,

            404,

        )