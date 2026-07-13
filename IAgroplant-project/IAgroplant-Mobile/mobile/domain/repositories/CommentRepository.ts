import { Comment, CommentAuthor } from '../entities/comment.entity';

// ─── COMMENT REPOSITORY ───────────────────────────────────────────────────────
// Interface de repositório conforme diagrama de classes da Wiki.
// Define o contrato que qualquer implementação (Mock, API, Supabase) deve seguir.
// A camada de domínio depende apenas desta interface — nunca de implementações concretas.

export interface ICommentRepository {
  listByPost(postId: string | number): Promise<Comment[]>;
  add(postId: string | number, content: string, author: CommentAuthor): Promise<Comment>;
}
