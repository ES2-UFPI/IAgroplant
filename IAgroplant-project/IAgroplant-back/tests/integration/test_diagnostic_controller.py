from django.test import TestCase
from rest_framework.test import APIClient


class DiagnosticControllerIntegrationTest(TestCase):

    def setUp(self):

        self.client = APIClient()

    def test_endpoint_exists(self):

        response = self.client.post(

            "/api/diagnostic",

            {},

            format="multipart"

        )

        self.assertNotEqual(

            response.status_code,

            404,

        )