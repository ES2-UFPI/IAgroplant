import { ConnectionRequest } from '../entities/connection.entity';

export interface IConnectionRepository {
  send(toUserId: string): Promise<ConnectionRequest>;
  listPending(): Promise<ConnectionRequest[]>;
  accept(connectionId: string): Promise<ConnectionRequest>;
  reject(connectionId: string): Promise<ConnectionRequest>;
}
