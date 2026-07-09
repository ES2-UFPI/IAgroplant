import { IChatReputationRepository } from '../../domain/repositories/ChatReputationRepository';

export class MarkChatReplyUsefulUseCase {
  constructor(private readonly repository: IChatReputationRepository) {}

  async execute(recipientUserId: string, messageId: string): Promise<void> {
    return this.repository.markUseful(recipientUserId, messageId);
  }
}
