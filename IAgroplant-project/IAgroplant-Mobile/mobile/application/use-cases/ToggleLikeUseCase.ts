import { IFeedRepository } from '../../domain/repositories/FeedRepository';

// ─── TOGGLE LIKE USE CASE ────────────────────────────────────────────────────
// Caso de uso para curtir ou descurtir um post.
// Decide qual operação realizar com base no estado atual (isLiked).

export class ToggleLikeUseCase {
  constructor(private readonly repository: IFeedRepository) {}

  async execute(postId: number | string, userId: string, isLiked: boolean): Promise<void> {
    if (isLiked) {
      await this.repository.unlike(postId, userId);
    } else {
      await this.repository.like(postId, userId);
    }
  }
}
