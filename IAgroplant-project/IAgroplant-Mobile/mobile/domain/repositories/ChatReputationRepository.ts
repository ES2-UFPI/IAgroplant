export interface IChatReputationRepository {
  markUseful(recipientUserId: string, messageId: string): Promise<void>;
}
