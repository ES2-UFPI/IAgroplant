import { IModerationRepository } from '../../domain/repositories/ModerationRepository';
import { post } from '../../infrastructure/api/api';

export class ApiModerationService implements IModerationRepository {
  async verifyPost(postId: number | string): Promise<void> {
    await post(`/moderation/posts/${postId}/verify`);
  }

  async removePost(postId: number | string): Promise<void> {
    await post(`/moderation/posts/${postId}/remove`);
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────

export const moderationRepository: IModerationRepository = new ApiModerationService();
