import { Post, PostType } from '../../domain/entities/post.entity';
import { IFeedRepository, PublishPostInput } from '../../domain/repositories/FeedRepository';
import { createPost } from '../../presentation/feed/factories';
import { get, post } from '../../infrastructure/api/api';

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
  createPost('simple', {
    id: 7,
    author: { name: 'Mariana Silva', role: 'Produtora', initials: 'MS', verified: true },
    content: 'Iniciando o controle preventivo na lavoura de #Tomate. Alguma sugestão para alternaria?',
    tags: ['Tomate', 'Manejo', 'Pragas'],
    likes: 12, comments: 4, region: 'São Paulo', time: 'agora',
    category: 'Manejo', liked: false,
  }),
  createPost('diagnostic', {
    id: 8,
    author: { name: 'Dr. Lucas Ribeiro', role: 'Consultor', initials: 'LR', verified: true },
    content: 'Diagnóstico em #Tomate: detectada Mancha Bacteriana (Xanthomonas spp.). Recomendado controle de umidade e aplicação de cobre.',
    tags: ['Tomate', 'Doença', 'Pragas'],
    likes: 45, comments: 11, region: 'Minas Gerais', time: 'há 10min',
    category: 'Diagnóstico IA', liked: false,
    pathogen: 'Xanthomonas spp.', severity: 'Moderada',
  }),
  createPost('opportunity', {
    id: 9,
    author: { name: 'Sítio Recanto', role: 'Produtor', initials: 'SR', verified: false },
    content: 'Procura-se auxiliar de colheita para lavoura de #Tomate cereja.',
    tags: ['Tomate', 'Vaga', 'Colheita'],
    likes: 3, comments: 2, region: 'Espírito Santo', time: 'há 1h',
    category: 'Vagas', liked: false, salary: 'R$ 1.800/mês', duration: '3 meses',
  }),
];

const PAGE_SIZE = 4;
const CATEGORY_MAP: Record<string, string> = {
  'Diagnóstico IA': 'diagnostic',
  'Vagas': 'opportunity',
};

// ─── MOCK IMPLEMENTATION ──────────────────────────────────────────────────────
// Implementa IFeedRepository com dados em memória.
// Simula latência de rede e paginação real.

export class MockPostService implements IFeedRepository {
  private likedPosts = new Set<number>();

  async getAll(page: number, filter: string): Promise<Post[]> {
    await delay(600);

    const filtered =
      filter === 'Todos'
        ? MOCK_POSTS
        : MOCK_POSTS.filter((p) => {
            if (CATEGORY_MAP[filter]) return p.type === CATEGORY_MAP[filter];
            // Se for uma categoria padrão cadastrada nas constantes
            if (['Diagnóstico IA', 'Vagas', 'Manejo', 'Pragas', 'Irrigação'].includes(filter)) {
              return p.category === filter;
            }
            // Caso contrário, busca no array de tags (case-insensitive)
            return p.tags && p.tags.some(t => t.toLowerCase() === filter.toLowerCase());
          });

    const start = (page - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    // aplica estado de curtida em memória
    return slice.map((p) => ({ ...p, liked: this.likedPosts.has(p.id as number) }));
  }

  async save(type: PostType, data: PublishPostInput): Promise<Post> {
    await delay(800);
    const newPost = createPost(type, {
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

    MOCK_POSTS.unshift(newPost);
    return newPost;
  }

  async like(postId: number | string, _userId: string): Promise<void> {
    await delay(200);
    this.likedPosts.add(Number(postId));
  }

  async unlike(postId: number | string, _userId: string): Promise<void> {
    await delay(200);
    this.likedPosts.delete(Number(postId));
  }
}

// ─── API IMPLEMENTATION ───────────────────────────────────────────────────────
// Implementa IFeedRepository consumindo a API REST.
// Fallback para MockPostService quando a API não está disponível.

export class ApiPostService implements IFeedRepository {
  private mockService = new MockPostService();

  async getAll(page: number, filter: string): Promise<Post[]> {
    try {
      const data = await get('/posts', { filter });
      if (Array.isArray(data)) {
        return data;
      }
    } catch (error: any) {
      console.log('Erro ao carregar posts da API, servindo dados locais...', error.message);
    }
    return this.mockService.getAll(page, filter);
  }

  async save(type: PostType, data: PublishPostInput): Promise<Post> {
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
    return this.mockService.save(type, data);
  }

  async like(postId: number | string, userId: string): Promise<void> {
    try {
      await post(`/posts/${postId}/like`);
      return;
    } catch (error: any) {
      console.log('Erro ao curtir post na API, executando localmente...', error.message);
    }
    return this.mockService.like(postId, userId);
  }

  async unlike(postId: number | string, userId: string): Promise<void> {
    try {
      await post(`/posts/${postId}/unlike`);
      return;
    } catch (error: any) {
      console.log('Erro ao descurtir post na API, executando localmente...', error.message);
    }
    return this.mockService.unlike(postId, userId);
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────
// Instância única do repositório usada por toda a aplicação.
// Os Use-Cases recebem esta instância como dependência.

export const feedRepository: IFeedRepository = new ApiPostService();

// Compatibilidade — alias para código legado que ainda importa postService
export const postService = feedRepository;

// ─── UTIL ─────────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Re-exporta PublishPostInput para manter compatibilidade com imports existentes
export type { PublishPostInput } from '../../domain/repositories/FeedRepository';
