import { useState, useEffect, useCallback, useRef } from 'react';
import { Post, PostType } from '../../../domain/entities/post.entity';
import { PublishPostInput } from '../../../domain/repositories/FeedRepository';
import { GetFeedUseCase } from '../../../application/use-cases/GetFeedUseCase';
import { PublishPostUseCase } from '../../../application/use-cases/PublishPostUseCase';
import { ToggleLikeUseCase } from '../../../application/use-cases/ToggleLikeUseCase';
import { VerifyPostUseCase } from '../../../application/use-cases/VerifyPostUseCase';
import { RemovePostUseCase } from '../../../application/use-cases/RemovePostUseCase';
import { feedRepository } from '../../../application/services/postService';
import { moderationRepository } from '../../../application/services/moderationService';
import { useAuth } from '../../auth/AuthContext';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const FILTER_CATEGORIES = [
  'Todos', 'Diagnóstico IA', 'Vagas', 'Manejo', 'Pragas', 'Irrigação',
];

// ─── USE-CASE INSTANCES ───────────────────────────────────────────────────────
// Instanciados uma única vez com o repositório injetado.

const getFeedUseCase = new GetFeedUseCase(feedRepository);
const publishPostUseCase = new PublishPostUseCase(feedRepository);
const toggleLikeUseCase = new ToggleLikeUseCase(feedRepository);
const verifyPostUseCase = new VerifyPostUseCase(moderationRepository);
const removePostUseCase = new RemovePostUseCase(moderationRepository);

// ─── FEED VIEW MODEL ─────────────────────────────────────────────────────────
// Hook que atua como FeedViewModel conforme diagrama de classes da Wiki.
// Gerencia o estado reativo e delega lógica de negócio aos Use-Cases.

export function useFeed(initialFilter = 'Todos') {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = useRef(1);
  const currentFilter = useRef(activeFilter);

  // ─── LOAD FEED (via GetFeedUseCase) ───────────────────────────────────────

  const loadPosts = useCallback(async (filter: string, reset = false) => {
    if (reset) {
      page.current = 1;
      setHasMore(true);
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const data = await getFeedUseCase.execute(page.current, filter);
      setPosts((prev) => {
        const combined = reset ? data : [...prev, ...data];
        return combined.filter((post, index, self) => 
          self.findIndex((p) => p.id === post.id) === index
        );
      });
      if (data.length === 0) setHasMore(false);
      else page.current += 1;
    } catch (e) {
      setError('Não foi possível carregar o feed. Tente novamente.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // carrega ao montar
  useEffect(() => {
    loadPosts(initialFilter, true);
  }, [initialFilter, loadPosts]);

  // recarrega ao trocar filtro
  useEffect(() => {
    if (currentFilter.current === activeFilter) return;
    currentFilter.current = activeFilter;
    loadPosts(activeFilter, true);
  }, [activeFilter]);

  // ─── PAGINAÇÃO ──────────────────────────────────────────────────────────────

  function loadMore() {
    if (isLoadingMore || !hasMore) return;
    loadPosts(activeFilter);
  }

  // ─── TOGGLE LIKE (via ToggleLikeUseCase) ──────────────────────────────────

  async function toggleLike(postId: number | string) {
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );

    try {
      await toggleLikeUseCase.execute(postId, user.id, post.liked);
    } catch {
      // reverte se falhar
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      );
    }
  }

  // ─── MODERAÇÃO (via Verify/RemovePostUseCase) ─────────────────────────────

  async function verifyPost(postId: number | string) {
    await verifyPostUseCase.execute(postId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, author: { ...p.author, verified: true } } : p
      )
    );
  }

  async function removePost(postId: number | string) {
    await removePostUseCase.execute(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  // ─── COMENTÁRIOS ────────────────────────────────────────────────────────────
  // Atualiza o contador de comentários de um post após um novo comentário ser
  // publicado via CommentsModal/useComments.

  function incrementCommentCount(postId: number | string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p))
    );
  }

  // ─── PUBLISH POST (via PublishPostUseCase) ────────────────────────────────

  async function publishPost(type: PostType, input: Omit<PublishPostInput, 'authorId' | 'authorName' | 'authorInitials' | 'authorVerified'>) {
    if (!user) throw new Error('Usuário não autenticado');

    setIsPublishing(true);
    try {
      const newPost = await publishPostUseCase.execute(type, {
        ...input,
        authorId: user.id,
        authorName: user.name ?? 'Usuário',
        authorRole: input.authorRole,
        authorInitials: (user.name ?? 'U')
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        authorVerified: false, // definido pelo backend com base no perfil
      });
      setPosts((prev) => [newPost, ...prev]);
    } finally {
      setIsPublishing(false);
    }
  }

  // ─── RETORNO ────────────────────────────────────────────────────────────────

  return {
    posts,
    activeFilter,
    setActiveFilter,
    isLoading,
    isLoadingMore,
    isPublishing,
    hasMore,
    error,
    loadMore,
    toggleLike,
    verifyPost,
    removePost,
    publishPost,
    incrementCommentCount,
    refresh: () => loadPosts(activeFilter, true),
  };
}
