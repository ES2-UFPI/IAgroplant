import { useState } from 'react';
import { Specialist } from '../../domain/entities/specialist.types';
import { searchSpecialists } from '../../application/services/specialistService';

export function useSpecialistSearch() {
  const [results, setResults] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function search(topic: string, region?: string) {
    setError(null);

    if (!topic.trim()) {
      setError('Digite um tema para buscar (ex: macaxeira, solo, pragas).');
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchSpecialists(topic.trim(), region?.trim());
      setResults(data);
      setHasSearched(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Não foi possível buscar especialistas agora.');
    } finally {
      setIsLoading(false);
    }
  }

  return { results, isLoading, error, hasSearched, search };
}