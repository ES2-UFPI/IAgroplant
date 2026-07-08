import { Post, PostType } from '../../domain/entities/post.entity';
import { IFeedRepository, PublishPostInput } from '../../domain/repositories/FeedRepository';

// ─── PUBLISH POST USE CASE ───────────────────────────────────────────────────
// Caso de uso para publicar um novo post no feed.
// Encapsula a regra de criação delegando ao repositório.

export class PublishPostUseCase {
  constructor(private readonly repository: IFeedRepository) {}

  async execute(type: PostType, data: PublishPostInput): Promise<Post> {
    return this.repository.save(type, data);
  }
}
