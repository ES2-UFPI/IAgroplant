import { useState, useEffect, useCallback, useRef } from 'react';
import { Post, PostType } from '../types/post.types';
import { postService, PublishPostInput } from '../../application/services/postService';
import auth from '@react-native-firebase/auth';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const FILTER_CATEGORIES = [
  'Todos', 'Diagnóstico IA', 'Vagas', 'Manejo', 'Pragas', 'Irrigação',
];

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = useRef(1);
  const currentFilter = useRef(activeFilter);

  // ─── FETCH ──────────────────────────────────────────────────────────────────

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
      const data = await postService.fetchPosts(page.current, filter);
      setPosts((prev) => reset ? data : [...prev, ...data]);
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
    loadPosts('Todos', true);
  }, []);

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

  // ─── CURTIDA ────────────────────────────────────────────────────────────────

  async function toggleLike(postId: number) {
    const user = auth().currentUser;
    if (!user) return;

    // optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      if (post.liked) {
        await postService.unlikePost(postId, user.uid);
      } else {
        await postService.likePost(postId, user.uid);
      }
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

  // ─── PUBLICAÇÃO ─────────────────────────────────────────────────────────────

  async function publishPost(type: PostType, input: Omit<PublishPostInput, 'authorId' | 'authorName' | 'authorInitials' | 'authorVerified'>) {
    const user = auth().currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    setIsPublishing(true);
    try {
      const newPost = await postService.publishPost(type, {
        ...input,
        authorId: user.uid,
        authorName: user.displayName ?? 'Usuário',
        authorRole: input.authorRole,
        authorInitials: (user.displayName ?? 'U')
          .split(' ')
          .map((n) => n[0])
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
    publishPost,
    refresh: () => loadPosts(activeFilter, true),
  };
}
