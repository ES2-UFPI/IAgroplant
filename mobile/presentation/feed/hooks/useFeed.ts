import { useState, useEffect, useCallback, useRef } from 'react';
import { Post, PostType } from '../types/post.types';
import { postService, PublishPostInput } from '../services/postService';

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
      setPosts((prev) => (reset ? data : [...prev, ...data]));
      if (data.length === 0) {
        setHasMore(false);
      } else {
        page.current += 1;
      }
    } catch {
      setError('Não foi possível carregar o feed. Tente novamente.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts('Todos', true);
  }, [loadPosts]);

  useEffect(() => {
    if (currentFilter.current === activeFilter) return;
    currentFilter.current = activeFilter;
    loadPosts(activeFilter, true);
  }, [activeFilter, loadPosts]);

  function loadMore() {
    if (isLoadingMore || !hasMore) return;
    loadPosts(activeFilter);
  }

  async function toggleLike(postId: number) {
    const user = { uid: 'local-user' };
    let originalLiked = false;

    setPosts((prev) => {
      const currentPost = prev.find((post) => post.id === postId);
      if (!currentPost) return prev;

      originalLiked = currentPost.liked;

      return prev.map((post) =>
        post.id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      );
    });

    try {
      if (originalLiked) {
        await postService.unlikePost(postId, user.uid);
      } else {
        await postService.likePost(postId, user.uid);
      }
    } catch {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      );
    }
  }

  async function publishPost(
    type: PostType,
    input: Omit<PublishPostInput, 'authorId' | 'authorName' | 'authorInitials' | 'authorVerified'>
  ) {
    const user = {
      uid: 'local-user',
      displayName: 'Usuário',
    };

    setIsPublishing(true);
    try {
      const newPost = await postService.publishPost(type, {
        ...input,
        authorId: user.uid,
        authorName: user.displayName ?? 'Usuário',
        authorRole: input.authorRole,
        authorInitials: (user.displayName ?? 'U')
          .split(' ')
          .map((name) => name[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        authorVerified: false,
      });

      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } finally {
      setIsPublishing(false);
    }
  }

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