// Domain Entities (source of truth)
export type {
  PostType,
  PostAuthor,
  PostBadge,
  BasePost,
  SimplePost,
  DiagnosticPost,
  OpportunityPost,
  Post,
} from '../../domain/entities/post.entity';

// Domain Repository Interface
export type { IFeedRepository, PublishPostInput } from '../../domain/repositories/FeedRepository';

// Use-Cases
export { GetFeedUseCase } from '../../application/use-cases/GetFeedUseCase';
export { PublishPostUseCase } from '../../application/use-cases/PublishPostUseCase';
export { ToggleLikeUseCase } from '../../application/use-cases/ToggleLikeUseCase';

// Factories
export { createPost } from './factories';
export { PostFactory } from './factories/PostFactory';
export {
  SimplePostFactory,
  DiagnosticPostFactory,
  OpportunityPostFactory,
} from './factories/ConcreteFactories';

// Components
export { PostCard } from './components/PostCard';
export { FilterBar } from './components/FilterBar';
export { ComposeBox } from './components/ComposeBox';

// Hooks (ViewModel)
export { useFeed, FILTER_CATEGORIES } from './hooks/useFeed';

// Screen
export { FeedScreen } from './FeedScreen';
