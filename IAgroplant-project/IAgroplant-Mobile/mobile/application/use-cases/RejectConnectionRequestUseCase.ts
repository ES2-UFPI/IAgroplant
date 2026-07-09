import { ConnectionRequest } from '../../domain/entities/connection.entity';
import { IConnectionRepository } from '../../domain/repositories/ConnectionRepository';

export class RejectConnectionRequestUseCase {
  constructor(private readonly repository: IConnectionRepository) {}

  async execute(connectionId: string): Promise<ConnectionRequest> {
    return this.repository.reject(connectionId);
  }
}
