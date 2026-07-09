import { ConnectionRequest } from '../../domain/entities/connection.entity';
import { IConnectionRepository } from '../../domain/repositories/ConnectionRepository';

export class SendConnectionRequestUseCase {
  constructor(private readonly repository: IConnectionRepository) {}

  async execute(toUserId: string): Promise<ConnectionRequest> {
    return this.repository.send(toUserId);
  }
}
