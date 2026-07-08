import { Post } from '../../domain/entities/post.entity';
import { IFeedRepository } from '../../domain/repositories/FeedRepository';

// ─── GET FEED USE CASE ────────────────────────────────────────────────────────
// Caso de uso para buscar posts do feed, conforme diagrama da Wiki.
// Recebe o repositório por injeção de dependência (Dependency Inversion).

export class GetFeedUseCase {
  constructor(private readonly repository: IFeedRepository) {}

  async execute(page: number, filter: string): Promise<Post[]> {
    return this.repository.getAll(page, filter);
  }
}
