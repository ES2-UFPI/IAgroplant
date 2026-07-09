import { ConnectionRequest } from '../../domain/entities/connection.entity';
import { IConnectionRepository } from '../../domain/repositories/ConnectionRepository';
import { get, post } from '../../infrastructure/api/api';

export class ApiConnectionService implements IConnectionRepository {
  async send(toUserId: string): Promise<ConnectionRequest> {
    return post('/connections', { to_user_id: toUserId });
  }

  async listPending(): Promise<ConnectionRequest[]> {
    try {
      const data = await get('/connections/pending');
      if (Array.isArray(data)) {
        return data;
      }
    } catch (error: any) {
      console.log('Erro ao carregar conexões pendentes, exibindo vazio...', error.message);
    }
    return [];
  }

  async accept(connectionId: string): Promise<ConnectionRequest> {
    return post(`/connections/${connectionId}/accept`);
  }

  async reject(connectionId: string): Promise<ConnectionRequest> {
    return post(`/connections/${connectionId}/reject`);
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────

export const connectionRepository: IConnectionRepository = new ApiConnectionService();
