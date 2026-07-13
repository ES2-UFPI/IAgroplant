import { Comment, CommentAuthor } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/CommentRepository';
import { get, post } from '../../infrastructure/api/api';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    postId: 1,
    author: { id: 'user-carlos', name: 'Carlos Mendes', role: 'Técnico Agrícola', initials: 'CM' },
    content: 'Excelente diagnóstico, Dra. Fernanda! Aqui na Bahia também temos visto incidência crescente de ferrugem asiática nesta safra.',
    time: 'há 1h30',
  },
  {
    id: 'comment-2',
    postId: 1,
    author: { id: 'user-ana', name: 'Ana Paula Costa', role: 'Produtora Rural', initials: 'AP' },
    content: 'Qual o intervalo de reaplicação recomendado para o fungicida?',
    time: 'há 1h',
  },
  {
    id: 'comment-3',
    postId: 2,
    author: { id: 'user-roberto', name: 'Dr. Roberto Alves', role: 'Fitopatologista', initials: 'RA' },
    content: 'Ótima economia de água! Vocês monitoraram algum impacto na compactação do solo com o gotejamento subsuperficial?',
    time: 'há 3h',
  },
];

// ─── MOCK IMPLEMENTATION ──────────────────────────────────────────────────────
// Implementa ICommentRepository com dados em memória.
// Simula latência de rede.

export class MockCommentService implements ICommentRepository {
  async listByPost(postId: string | number): Promise<Comment[]> {
    await delay(500);
    return MOCK_COMMENTS.filter((c) => String(c.postId) === String(postId));
  }

  async add(postId: string | number, content: string, author: CommentAuthor): Promise<Comment> {
    await delay(700);
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      author,
      content,
      time: 'agora',
    };

    MOCK_COMMENTS.push(newComment);
    return newComment;
  }
}

// ─── API IMPLEMENTATION ───────────────────────────────────────────────────────
// Implementa ICommentRepository consumindo a API REST.
// Fallback para MockCommentService quando a API não está disponível.

export class ApiCommentService implements ICommentRepository {
  private mockService = new MockCommentService();

  async listByPost(postId: string | number): Promise<Comment[]> {
    try {
      const data = await get(`/posts/${postId}/comments`);
      if (Array.isArray(data)) {
        return data.map((item) => ({ ...item, postId }));
      }
    } catch (error: any) {
      console.log('Erro ao carregar comentários da API, servindo dados locais...', error.message);
    }
    return this.mockService.listByPost(postId);
  }

  async add(postId: string | number, content: string, author: CommentAuthor): Promise<Comment> {
    try {
      const response = await post(`/posts/${postId}/comments`, { content });
      if (response && response.id) {
        return { ...response, postId };
      }
    } catch (error: any) {
      console.log('Erro ao publicar comentário na API, usando local fallback...', error.message);
    }
    return this.mockService.add(postId, content, author);
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────
// Instância única do repositório usada por toda a aplicação.
// Os Use-Cases recebem esta instância como dependência.

export const commentRepository: ICommentRepository = new ApiCommentService();

// Compatibilidade — alias seguindo o mesmo padrão de postService
export const commentService = commentRepository;

// ─── UTIL ─────────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
