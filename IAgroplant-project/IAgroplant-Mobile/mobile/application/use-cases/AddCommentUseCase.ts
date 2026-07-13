import { Comment, CommentAuthor } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/CommentRepository';

// ─── ADD COMMENT USE CASE ─────────────────────────────────────────────────────
// Caso de uso para publicar um novo comentário em um post.
// Encapsula a regra de negócio (conteúdo não pode ser vazio) delegando ao repositório.

export class AddCommentUseCase {
  constructor(private readonly repository: ICommentRepository) {}

  async execute(postId: string | number, content: string, author: CommentAuthor): Promise<Comment> {
    if (!content || !content.trim()) {
      throw new Error('O conteúdo do comentário não pode ser vazio.');
    }

    return this.repository.add(postId, content, author);
  }
}
