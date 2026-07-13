// ─── COMMENT ENTITY ───────────────────────────────────────────────────────────
// Entidade de domínio — independente de framework e camada de apresentação.
// Segue o diagrama de classes da Wiki (Módulo Feed).

export interface CommentAuthor {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface Comment {
  id: string;
  postId: string | number;
  author: CommentAuthor;
  content: string;
  time: string;
}
