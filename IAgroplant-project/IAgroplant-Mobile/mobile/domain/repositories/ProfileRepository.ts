import { UserProfile, UpdateProfileInput } from '../entities/profile.types';

export interface IProfileRepository {
  getMe(): Promise<UserProfile>;
  updateMe(input: UpdateProfileInput): Promise<UserProfile>;
  uploadPhoto(uri: string): Promise<UserProfile>;
}
