import { Notification } from '../../domain/entities/notification.types';
import { get, patch } from '../../infrastructure/api/api';
import { oportunidadesService } from './oportunidadesService';

// ─── LOCAL MOCK STATE ─────────────────────────────────────────────────────────
let LOCAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'demo-user',
    title: 'Novo Estágio na sua Região!',
    body: 'A vaga "Estagiário em Manejo de Solo" está disponível em Piauí.',
    type: 'OPPORTUNITY',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    metadata: { vacancy_id: 'vaga-1', culture: 'Soja', salary: 'R$ 1.500,00' },
  },
  {
    id: 'notif-2',
    user_id: 'demo-user',
    title: 'Mensagem de Produtor Rural',
    body: 'Carlos: Olá João, vi sua candidatura para a vaga de agronomia...',
    type: 'CHAT_MESSAGE',
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    metadata: { chat_id: 'chat-abc' },
  },
  {
    id: 'notif-3',
    user_id: 'demo-user',
    title: 'Boas-vindas ao IAgroplant!',
    body: 'Seu perfil foi criado com sucesso. Complete seus dados para ver vagas.',
    type: 'SYSTEM',
    is_read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  }
];

// ─── IMPLEMENTATION ───────────────────────────────────────────────────────────
export class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await get('/notifications/');
      if (Array.isArray(data)) {
        LOCAL_NOTIFICATIONS = data;
      }
    } catch (e) {
      console.log('Backend indisponível, servindo notificações locais...');
    }

    const list = [...LOCAL_NOTIFICATIONS];
    try {
      const apps = await oportunidadesService.getApplications('mock-token');
      apps.forEach((app) => {
        const notifId = `notif-app-${app.id}`;
        const exists = list.some(n => n.id === notifId);
        if (!exists) {
          list.unshift({
            id: notifId,
            user_id: 'demo-user',
            title: 'Nova Candidatura Recebida! 🚜',
            body: `${app.user_name} (${app.user_role}) se candidatou para a vaga de "${app.vacancy_title}" em ${app.vacancy_region}.`,
            type: 'OPPORTUNITY',
            is_read: false,
            created_at: app.applied_at,
          });
        }
      });
    } catch (e) {
      console.log('Erro ao mesclar candidaturas locais com notificações:', e);
    }

    return list;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await patch(`/notifications/${notificationId}/read/`);
      if (response && response.success) {
        LOCAL_NOTIFICATIONS = LOCAL_NOTIFICATIONS.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        );
        return true;
      }
    } catch (e) {
      console.log('Backend indisponível, marcando notificação como lida localmente...');
    }

    // Local fallback mark as read
    LOCAL_NOTIFICATIONS = LOCAL_NOTIFICATIONS.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    return true;
  }
}

export const notificationService = new NotificationService();
