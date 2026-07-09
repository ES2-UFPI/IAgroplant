import { IModerationRepository } from '../../domain/repositories/ModerationRepository';

export class VerifyPostUseCase {
  constructor(private readonly repository: IModerationRepository) {}

  async execute(postId: number | string): Promise<void> {
    return this.repository.verifyPost(postId);
  }
}
