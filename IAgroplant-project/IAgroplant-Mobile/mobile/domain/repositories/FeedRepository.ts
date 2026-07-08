import { Post, PostType } from '../entities/post.entity';

// ─── FEED REPOSITORY ──────────────────────────────────────────────────────────
// Interface de repositório conforme diagrama de classes da Wiki.
// Define o contrato que qualquer implementação (Mock, API, Supabase) deve seguir.
// A camada de domínio depende apenas desta interface — nunca de implementações concretas.

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

export interface IFeedRepository {
  getAll(page: number, filter: string): Promise<Post[]>;
  save(type: PostType, data: PublishPostInput): Promise<Post>;
  like(postId: number | string, userId: string): Promise<void>;
  unlike(postId: number | string, userId: string): Promise<void>;
}
