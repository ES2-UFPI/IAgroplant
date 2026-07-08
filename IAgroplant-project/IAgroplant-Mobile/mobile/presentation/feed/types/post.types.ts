// ─── RE-EXPORT ────────────────────────────────────────────────────────────────
// Os tipos de Post agora vivem na camada de domínio (domain/entities/post.entity).
// Este arquivo re-exporta tudo para manter compatibilidade com imports existentes
// na camada de apresentação.

export type {
  PostType,
  PostAuthor,
  PostBadge,
  BasePost,
  SimplePost,
  DiagnosticPost,
  OpportunityPost,
  Post,
} from '../../../domain/entities/post.entity';
