import { ConnectionRequest } from '../../domain/entities/connection.entity';
import { IConnectionRepository } from '../../domain/repositories/ConnectionRepository';

export class ListPendingConnectionsUseCase {
  constructor(private readonly repository: IConnectionRepository) {}

  async execute(): Promise<ConnectionRequest[]> {
    return this.repository.listPending();
  }
}
