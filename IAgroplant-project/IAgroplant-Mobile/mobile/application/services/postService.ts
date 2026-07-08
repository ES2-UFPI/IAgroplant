import { Post, PostType } from '../../presentation/feed/types/post.types';
import { createPost } from '../../presentation/feed/factories';
import { get, post } from '../../infrastructure/api/api';

// ─── INTERFACE ────────────────────────────────────────────────────────────────
// Contrato que qualquer implementação de serviço de posts deve seguir.
// Quando o Supabase estiver pronto, basta criar SupabasePostService
// implementando essa mesma interface — o restante do app não muda.

export interface IPostService {
  fetchPosts(page: number, filter: string): Promise<Post[]>;
  likePost(postId: number | string, userId: string): Promise<void>;
  unlikePost(postId: number | string, userId: string): Promise<void>;
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
  // campos específicos por tipo
  pathogen?: string;
  severity?: 'Baixa' | 'Moderada' | 'Alta';
  salary?: string;
  duration?: string;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_POSTS: Post[] = [
  createPost('diagnostic', {
    id: 1,
    author: { name: 'Dra. Fernanda Luz', role: 'Agrônoma', initials: 'FL', verified: true },
    content: 'Diagnóstico em soja no Piauí: identificado Phakopsora pachyrhizi (ferrugem asiática) em estágio inicial. Recomendo triazol + estrobilurina. Incidência estimada: 18%.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    tags: ['Soja', 'Ferrugem Asiática', 'Fungicida'],
    likes: 142, comments: 31, region: 'Piauí', time: 'há 2h',
    category: 'Diagnóstico IA', liked: false,
    pathogen: 'Phakopsora pachyrhizi', severity: 'Moderada',
  }),
  createPost('simple', {
    id: 2,
    author: { name: 'Carlos Mendes', role: 'Técnico Agrícola', initials: 'CM', verified: true },
    content: 'Ótimo resultado com gotejamento subsuperficial no milho! −35% no consumo hídrico e +20% na produtividade vs. aspersão convencional.',
    image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&q=80',
    tags: ['Milho', 'Irrigação', 'Gotejamento'],
    likes: 87, comments: 24, region: 'Bahia', time: 'há 4h',
    category: 'Irrigação', liked: false,
  }),
  createPost('opportunity', {
    id: 3,
    author: { name: 'Fazenda Boa Vista', role: 'Empresa Agrícola', initials: 'BV', verified: false },
    content: 'Estamos contratando! Estagiário em Agronomia para manejo de culturas de grãos.',
    tags: ['Estágio', 'Agronomia', 'Grãos'],
    likes: 56, comments: 18, region: 'Mato Grosso', time: 'há 6h',
    category: 'Vagas', liked: false, salary: 'R$ 1.200/mês + benefícios', duration: '12 meses',
  }),
  createPost('diagnostic', {
    id: 4,
    author: { name: 'Dr. Roberto Alves', role: 'Fitopatologista', initials: 'RA', verified: true },
    content: 'Mancha foliar em algodão: provável Cercospora gossypina. Condições favoráveis à progressão. Recomendo cúpricos.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80',
    tags: ['Algodão', 'Cercospora', 'Manejo'],
    likes: 203, comments: 45, region: 'Mato Grosso', time: 'há 8h',
    category: 'Diagnóstico IA', liked: false,
    pathogen: 'Cercospora gossypina', severity: 'Alta',
  }),
  createPost('simple', {
    id: 5,
    author: { name: 'Ana Paula Costa', role: 'Produtora Rural', initials: 'AP', verified: false },
    content: 'Alguém tem experiência com consórcio milho + Brachiaria ruziziensis? Quero testar ILP em 150 ha no cerrado.',
    tags: ['ILP', 'Milho', 'Braquiária', 'Cerrado'],
    likes: 34, comments: 42, region: 'Goiás', time: 'há 12h',
    category: 'Manejo', liked: false,
  }),
  createPost('opportunity', {
    id: 6,
    author: { name: 'Cooperativa AgroNorte', role: 'Cooperativa', initials: 'AN', verified: true },
    content: 'Vaga para Agrônomo pleno. Acompanhamento de 80 associados em soja e milho. CREA ativo exigido.',
    tags: ['Agronomia', 'CREA', 'Cooperativa'],
    likes: 91, comments: 27, region: 'Pará', time: 'há 1d',
    category: 'Vagas', liked: false, salary: 'R$ 5.800/mês + PLR', duration: 'CLT',
  }),
];

const PAGE_SIZE = 4;
const CATEGORY_MAP: Record<string, string> = {
  'Diagnóstico IA': 'diagnostic',
  'Vagas': 'opportunity',
};

// ─── MOCK IMPLEMENTATION ──────────────────────────────────────────────────────
// Simula latência de rede e paginação real.
// Substitua por SupabasePostService quando o banco estiver modelado.

export class MockPostService implements IPostService {
  private likedPosts = new Set<number>();

  async fetchPosts(page: number, filter: string): Promise<Post[]> {
    await delay(600);

    const filtered =
      filter === 'Todos'
        ? MOCK_POSTS
        : MOCK_POSTS.filter((p) => {
            if (CATEGORY_MAP[filter]) return p.type === CATEGORY_MAP[filter];
            return p.category === filter;
          });

    const start = (page - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    // aplica estado de curtida em memória
    return slice.map((p) => ({ ...p, liked: this.likedPosts.has(p.id) }));
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
        type === 'diagnostic' ? 'Diagnóstico IA'
        : type === 'opportunity' ? 'Vagas'
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

// ─── API IMPLEMENTATION ───────────────────────────────────────────────────────

export class ApiPostService implements IPostService {
  private mockService = new MockPostService();

  async fetchPosts(page: number, filter: string): Promise<Post[]> {
    try {
      const data = await get('/posts', { filter });
      if (Array.isArray(data)) {
        return data;
      }
    } catch (error: any) {
      console.log('Erro ao carregar posts da API, servindo dados locais...', error.message);
    }
    return this.mockService.fetchPosts(page, filter);
  }

  async likePost(postId: number | string, userId: string): Promise<void> {
    try {
      await post(`/posts/${postId}/like`);
      return;
    } catch (error: any) {
      console.log('Erro ao curtir post na API, executando localmente...', error.message);
    }
    return this.mockService.likePost(Number(postId) || 0, userId);
  }

  async unlikePost(postId: number | string, userId: string): Promise<void> {
    try {
      await post(`/posts/${postId}/unlike`);
      return;
    } catch (error: any) {
      console.log('Erro ao descurtir post na API, executando localmente...', error.message);
    }
    return this.mockService.unlikePost(Number(postId) || 0, userId);
  }

  async publishPost(type: PostType, data: PublishPostInput): Promise<Post> {
    try {
      const payload = {
        type,
        content: data.content,
        image_url: data.image || null,
        tags: data.tags,
        region: data.region,
        pathogen: data.pathogen || null,
        severity: data.severity || null,
        salary: data.salary || null,
        duration: data.duration || null,
      };
      const response = await post('/posts', payload);
      if (response && response.id) {
        return response;
      }
    } catch (error: any) {
      console.log('Erro ao publicar post na API, usando local fallback...', error.message);
    }
    return this.mockService.publishPost(type, data);
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────

export const postService: IPostService = new ApiPostService();

// ─── UTIL ─────────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
