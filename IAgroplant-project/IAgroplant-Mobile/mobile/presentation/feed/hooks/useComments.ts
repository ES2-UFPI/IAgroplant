import { useState, useEffect, useCallback } from 'react';
import { Comment, CommentAuthor } from '../../../domain/entities/comment.entity';
import { GetCommentsUseCase } from '../../../application/use-cases/GetCommentsUseCase';
import { AddCommentUseCase } from '../../../application/use-cases/AddCommentUseCase';
import { commentRepository } from '../../../application/services/commentService';
import { useAuth } from '../../auth/AuthContext';

// ─── USE-CASE INSTANCES ───────────────────────────────────────────────────────
// Instanciados uma única vez com o repositório injetado.

const getCommentsUseCase = new GetCommentsUseCase(commentRepository);
const addCommentUseCase = new AddCommentUseCase(commentRepository);

// ─── COMMENTS VIEW MODEL ──────────────────────────────────────────────────────
// Hook que atua como CommentsViewModel, análogo ao useFeed.
// Gerencia o estado reativo dos comentários de um post e delega a lógica de
// negócio aos Use-Cases.

export function useComments(postId: string | number | null) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── LOAD COMMENTS (via GetCommentsUseCase) ───────────────────────────────

  const loadComments = useCallback(async () => {
    if (postId == null) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getCommentsUseCase.execute(postId);
      setComments(data);
    } catch (e) {
      setError('Não foi possível carregar os comentários.');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId == null) {
      setComments([]);
      return;
    }
    loadComments();
  }, [postId, loadComments]);

  // ─── ADD COMMENT (via AddCommentUseCase) ──────────────────────────────────

  async function addComment(content: string): Promise<Comment | null> {
    if (postId == null || !user) return null;

    setIsSubmitting(true);
    try {
      const author: CommentAuthor = {
        id: user.id,
        name: user.name ?? 'Usuário',
        role: user.role ?? 'Estudante',
        initials: (user.name ?? 'U')
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
      };

      const newComment = await addCommentUseCase.execute(postId, content, author);
      setComments((prev) => [...prev, newComment]);
      return newComment;
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── RETORNO ────────────────────────────────────────────────────────────────

  return {
    comments,
    isLoading,
    isSubmitting,
    error,
    addComment,
    refresh: loadComments,
  };
}
