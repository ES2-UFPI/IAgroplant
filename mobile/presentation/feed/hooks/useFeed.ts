import { useState } from 'react';
import { Post, PostType } from '../types/post.types';
import { createPost } from '../factories';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Em produção, substituir pelo serviço Supabase (GET /posts?page=1&limit=20)

const MOCK_POSTS: Post[] = [
  createPost('diagnostic', {
    id: 1,
    author: { name: 'Dra. Fernanda Luz', role: 'Agrônoma', initials: 'FL', verified: true },
    content:
      'Diagnóstico em soja no Piauí: identificado Phakopsora pachyrhizi (ferrugem asiática) em estágio inicial. Recomendo triazol + estrobilurina. Incidência estimada: 18%.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    tags: ['Soja', 'Ferrugem Asiática', 'Fungicida'],
    likes: 142,
    comments: 31,
    region: 'Piauí',
    time: 'há 2h',
    category: 'Diagnóstico IA',
    liked: false,
    pathogen: 'Phakopsora pachyrhizi',
    severity: 'Moderada',
  }),
  createPost('simple', {
    id: 2,
    author: { name: 'Carlos Mendes', role: 'Técnico Agrícola', initials: 'CM', verified: true },
    content:
      'Ótimo resultado com gotejamento subsuperficial no milho! −35% no consumo hídrico e +20% na produtividade vs. aspersão convencional. Quem mais testou?',
    image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&q=80',
    tags: ['Milho', 'Irrigação', 'Gotejamento'],
    likes: 87,
    comments: 24,
    region: 'Bahia',
    time: 'há 4h',
    category: 'Irrigação',
    liked: false,
  }),
  createPost('opportunity', {
    id: 3,
    author: { name: 'Fazenda Boa Vista', role: 'Empresa Agrícola', initials: 'BV', verified: false },
    content:
      'Estamos contratando! Buscamos estagiário em Agronomia para manejo de culturas de grãos. Oportunidade com profissionais experientes em campo.',
    tags: ['Estágio', 'Agronomia', 'Grãos'],
    likes: 56,
    comments: 18,
    region: 'Mato Grosso',
    time: 'há 6h',
    category: 'Vagas',
    liked: false,
    salary: 'R$ 1.200/mês + benefícios',
    duration: '12 meses',
  }),
  createPost('diagnostic', {
    id: 4,
    author: { name: 'Dr. Roberto Alves', role: 'Fitopatologista', initials: 'RA', verified: true },
    content:
      'Mancha foliar em algodão: provável Cercospora gossypina. Condições favoráveis à progressão. Recomendo monitoramento semanal e cúpricos.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80',
    tags: ['Algodão', 'Cercospora', 'Manejo'],
    likes: 203,
    comments: 45,
    region: 'Mato Grosso',
    time: 'há 8h',
    category: 'Diagnóstico IA',
    liked: false,
    pathogen: 'Cercospora gossypina',
    severity: 'Alta',
  }),
  createPost('simple', {
    id: 5,
    author: { name: 'Ana Paula Costa', role: 'Produtora Rural', initials: 'AP', verified: false },
    content:
      'Alguém tem experiência com consórcio milho + Brachiaria ruziziensis? Quero testar ILP em 150 ha no cerrado. Aceito dicas!',
    tags: ['ILP', 'Milho', 'Braquiária', 'Cerrado'],
    likes: 34,
    comments: 42,
    region: 'Goiás',
    time: 'há 12h',
    category: 'Manejo',
    liked: false,
  }),
  createPost('opportunity', {
    id: 6,
    author: { name: 'Cooperativa AgroNorte', role: 'Cooperativa', initials: 'AN', verified: true },
    content:
      'Vaga para Agrônomo pleno. Acompanhamento técnico de 80 associados em soja e milho. CREA ativo e disponibilidade para viagens.',
    tags: ['Agronomia', 'CREA', 'Cooperativa'],
    likes: 91,
    comments: 27,
    region: 'Pará',
    time: 'há 1d',
    category: 'Vagas',
    liked: false,
    salary: 'R$ 5.800/mês + PLR',
    duration: 'CLT',
  }),
];

export const FILTER_CATEGORIES = ['Todos', 'Diagnóstico IA', 'Vagas', 'Manejo', 'Pragas', 'Irrigação'];

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useFeed() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isLoading, setIsLoading] = useState(false);

  const filteredPosts =
    activeFilter === 'Todos' ? posts : posts.filter((p) => p.category === activeFilter);

  function toggleLike(id: number) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p))
    );
  }

  function publishPost(type: PostType, content: string) {
    if (!content.trim()) return;
    const newPost = createPost(type, {
      id: Date.now(),
      author: { name: 'Você', role: 'Produtor Rural', initials: 'VO', verified: false },
      content,
      tags: ['MeuPost'],
      likes: 0,
      comments: 0,
      region: 'Brasil',
      time: 'agora',
      category:
        type === 'diagnostic' ? 'Diagnóstico IA' : type === 'opportunity' ? 'Vagas' : 'Manejo',
      liked: false,
      ...(type === 'diagnostic'
        ? { pathogen: 'Em análise', severity: 'Baixa' }
        : {}),
      ...(type === 'opportunity'
        ? { salary: 'A combinar', duration: 'A definir' }
        : {}),
    });
    setPosts((prev) => [newPost, ...prev]);
  }

  return {
    posts: filteredPosts,
    activeFilter,
    setActiveFilter,
    isLoading,
    toggleLike,
    publishPost,
  };
}