export interface IModerationRepository {
  verifyPost(postId: number | string): Promise<void>;
  removePost(postId: number | string): Promise<void>;
}
