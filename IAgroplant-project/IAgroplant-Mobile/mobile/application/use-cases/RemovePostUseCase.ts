import { IModerationRepository } from '../../domain/repositories/ModerationRepository';

export class RemovePostUseCase {
  constructor(private readonly repository: IModerationRepository) {}

  async execute(postId: number | string): Promise<void> {
    return this.repository.removePost(postId);
  }
}
