import { Post, PostType } from '../../../domain/entities/post.entity';
import { PostFactory } from './PostFactory';
import {
  SimplePostFactory,
  DiagnosticPostFactory,
  OpportunityPostFactory,
} from './ConcreteFactories';

// ─── REGISTRY ─────────────────────────────────────────────────────────────────
// Mapeia cada PostType para sua fábrica concreta.
// O código cliente chama createPost() sem saber qual classe é instanciada.

const registry: Record<PostType, PostFactory> = {
  simple: new SimplePostFactory(),
  diagnostic: new DiagnosticPostFactory(),
  opportunity: new OpportunityPostFactory(),
};

export function createPost(type: PostType, data: any): Post {
  const factory = registry[type];
  if (!factory) throw new Error(`Tipo de post desconhecido: ${type}`);
  return factory.create(data);
}
