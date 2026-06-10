import { Post, BasePost } from '../types/post.types';

// ─── FACTORY METHOD PATTERN ───────────────────────────────────────────────────
// PostFactory define a interface para criação de posts.
// Cada subclasse concreta implementa create() para seu tipo específico,
// sem que o código cliente precise conhecer a classe instanciada.
// Isso segue o Princípio Aberto/Fechado: novos tipos de post = nova fábrica,
// sem modificar código existente.

export abstract class PostFactory {
  abstract create(data: Omit<BasePost, 'type' | 'badge'>): Post;
}