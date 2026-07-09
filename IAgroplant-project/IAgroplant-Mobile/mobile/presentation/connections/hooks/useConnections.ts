import { useState, useEffect, useCallback } from 'react';
import { ConnectionRequest } from '../../../domain/entities/connection.entity';
import { SendConnectionRequestUseCase } from '../../../application/use-cases/SendConnectionRequestUseCase';
import { ListPendingConnectionsUseCase } from '../../../application/use-cases/ListPendingConnectionsUseCase';
import { AcceptConnectionRequestUseCase } from '../../../application/use-cases/AcceptConnectionRequestUseCase';
import { RejectConnectionRequestUseCase } from '../../../application/use-cases/RejectConnectionRequestUseCase';
import { connectionRepository } from '../../../application/services/connectionService';

const sendConnectionRequestUseCase = new SendConnectionRequestUseCase(connectionRepository);
const listPendingConnectionsUseCase = new ListPendingConnectionsUseCase(connectionRepository);
const acceptConnectionRequestUseCase = new AcceptConnectionRequestUseCase(connectionRepository);
const rejectConnectionRequestUseCase = new RejectConnectionRequestUseCase(connectionRepository);

export function useConnections() {
  const [pending, setPending] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listPendingConnectionsUseCase.execute();
      setPending(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function sendRequest(toUserId: string): Promise<boolean> {
    setIsSubmitting(true);
    setError(null);
    try {
      await sendConnectionRequestUseCase.execute(toUserId);
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Não foi possível enviar a solicitação de conexão.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function accept(connectionId: string): Promise<boolean> {
    setIsSubmitting(true);
    setError(null);
    try {
      await acceptConnectionRequestUseCase.execute(connectionId);
      setPending((prev) => prev.filter((c) => c.id !== connectionId));
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Não foi possível aceitar a conexão.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reject(connectionId: string): Promise<boolean> {
    setIsSubmitting(true);
    setError(null);
    try {
      await rejectConnectionRequestUseCase.execute(connectionId);
      setPending((prev) => prev.filter((c) => c.id !== connectionId));
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Não foi possível rejeitar a conexão.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { pending, isLoading, isSubmitting, error, sendRequest, accept, reject, refresh: load };
}
