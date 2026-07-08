export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any> | null;
}

export interface NotificationPreference {
  user_id: string;
  type: string;
  enabled: boolean;
}
