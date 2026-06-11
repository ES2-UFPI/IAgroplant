import { Post, PostType } from '../types/post.types';
import { createPost } from '../factories';

export interface IPostService {
  fetchPosts(page: number, filter: string): Promise<Post[]>;
  likePost(postId: number, userId: string): Promise<void>;
  unlikePost(postId: number, userId: string): Promise<void>;
  publishPost(type: PostType, data: PublishPostInput): Promise<Post>;
}

export interface PublishPostInput {
  content: string;
  tags: string[];
  image?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  authorVerified: boolean;
  region: string;
  pathogen?: string;
  severity?: 'Baixa' | 'Moderada' | 'Alta';
  salary?: string;
  duration?: string;
}

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
      'Ótimo resultado com gotejamento subsuperficial no milho! −35% no consumo hídrico e +20% na produtividade vs. aspersão convencional.',
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
    content: 'Estamos contratando! Estagiário em Agronomia para manejo de culturas de grãos.',
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
      'Mancha foliar em algodão: provável Cercospora gossypina. Condições favoráveis à progressão. Recomendo cúpricos.',
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
      'Alguém tem experiência com consórcio milho + Brachiaria ruziziensis? Quero testar ILP em 150 ha no cerrado.',
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
    content: 'Vaga para Agrônomo pleno. Acompanhamento de 80 associados em soja e milho. CREA ativo exigido.',
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

const PAGE_SIZE = 4;
const CATEGORY_MAP: Record<string, string> = {
  'Diagnóstico IA': 'diagnostic',
  Vagas: 'opportunity',
};

export class MockPostService implements IPostService {
  private likedPosts = new Set<number>();

  async fetchPosts(page: number, filter: string): Promise<Post[]> {
    await delay(600);

    const filtered =
      filter === 'Todos'
        ? MOCK_POSTS
        : MOCK_POSTS.filter((post) => {
            if (CATEGORY_MAP[filter]) return post.type === CATEGORY_MAP[filter];
            return post.category === filter;
          });

    const start = (page - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    return slice.map((post) => ({ ...post, liked: this.likedPosts.has(post.id) }));
  }

  async likePost(postId: number, _userId: string): Promise<void> {
    await delay(200);
    this.likedPosts.add(postId);
  }

  async unlikePost(postId: number, _userId: string): Promise<void> {
    await delay(200);
    this.likedPosts.delete(postId);
  }

  async publishPost(type: PostType, data: PublishPostInput): Promise<Post> {
    await delay(800);

    return createPost(type, {
      id: Date.now(),
      author: {
        name: data.authorName,
        role: data.authorRole,
        initials: data.authorInitials,
        verified: data.authorVerified,
      },
      content: data.content,
      image: data.image,
      tags: data.tags,
      likes: 0,
      comments: 0,
      region: data.region,
      time: 'agora',
      category:
        type === 'diagnostic'
          ? 'Diagnóstico IA'
          : type === 'opportunity'
            ? 'Vagas'
            : 'Manejo',
      liked: false,
      ...(type === 'diagnostic'
        ? { pathogen: data.pathogen ?? 'Em análise', severity: data.severity ?? 'Baixa' }
        : {}),
      ...(type === 'opportunity'
        ? { salary: data.salary ?? 'A combinar', duration: data.duration ?? 'A definir' }
        : {}),
    });
  }
}

export const postService: IPostService = new MockPostService();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}