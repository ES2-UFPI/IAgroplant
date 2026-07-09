import { IChatReputationRepository } from '../../domain/repositories/ChatReputationRepository';
import { post } from '../../infrastructure/api/api';

export class ApiChatReputationService implements IChatReputationRepository {
  async markUseful(recipientUserId: string, messageId: string): Promise<void> {
    await post('/chat/mark-useful', { recipient_user_id: recipientUserId, message_id: messageId });
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────

export const chatReputationRepository: IChatReputationRepository = new ApiChatReputationService();
