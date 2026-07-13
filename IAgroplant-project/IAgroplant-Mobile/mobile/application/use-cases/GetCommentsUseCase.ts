import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/CommentRepository';

// ─── GET COMMENTS USE CASE ────────────────────────────────────────────────────
// Caso de uso para buscar os comentários de um post.
// Recebe o repositório por injeção de dependência (Dependency Inversion).

export class GetCommentsUseCase {
  constructor(private readonly repository: ICommentRepository) {}

  async execute(postId: string | number): Promise<Comment[]> {
    return this.repository.listByPost(postId);
  }
}
