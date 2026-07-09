import { ConnectionRequest } from '../../domain/entities/connection.entity';
import { IConnectionRepository } from '../../domain/repositories/ConnectionRepository';

export class AcceptConnectionRequestUseCase {
  constructor(private readonly repository: IConnectionRepository) {}

  async execute(connectionId: string): Promise<ConnectionRequest> {
    return this.repository.accept(connectionId);
  }
}
