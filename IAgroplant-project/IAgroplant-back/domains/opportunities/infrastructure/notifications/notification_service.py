import logging

logger = logging.getLogger(__name__)


class NotificationService:

    def send_push_notification(
        self,
        recipient_id: str,
        title: str,
        body: str,
        data: dict
    ) -> bool:
        """
        Simula o envio de notificação push via Firebase Cloud Messaging (FCM).
        Em produção, integraria com o SDK do Firebase.
        """
        print("\n--- [PUSH NOTIFICATION SENT] ---")
        print(f"To User ID: {recipient_id}")
        print(f"Title     : {title}")
        print(f"Body      : {body}")
        print(f"Data      : {data}")
        print("--------------------------------\n")
        
        logger.info(
            f"Push notification sent to {recipient_id}: {title} - {body}"
        )
        return True
