import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Vaga, Candidatura } from '../../domain/entities/vaga.types';
import { oportunidadesService } from '../../application/services/oportunidadesService';
import { useAuth } from '../auth/AuthContext';

export type OpportunitiesFilters = {
  region: string;
  culture: string;
  vacancy_type: string;
};

export function useOpportunities() {
  const { user } = useAuth();
  
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<OpportunitiesFilters>({
    region: '',
    culture: 'Todos',
    vacancy_type: 'Todos',
  });

  // ─── LOAD VACANCIES ─────────────────────────────────────────────────────────
  const fetchVacancies = useCallback(async (currentFilters: OpportunitiesFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = {
        region: currentFilters.region.trim() !== '' ? currentFilters.region : undefined,
        culture: currentFilters.culture !== 'Todos' ? currentFilters.culture : undefined,
        vacancy_type: currentFilters.vacancy_type !== 'Todos' ? currentFilters.vacancy_type : undefined,
      };
      
      const data = await oportunidadesService.getAll(apiFilters);
      setVagas(data);
    } catch (e: any) {
      setError('Não foi possível carregar as vagas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── LOAD APPLICATIONS ──────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    try {
      const data = await oportunidadesService.getApplications('mock-token');
      setCandidaturas(data);
    } catch (e) {
      console.warn('Erro ao carregar histórico de candidaturas', e);
    }
  }, []);

  // ─── APPLY TO VAGA ──────────────────────────────────────────────────────────
  const applyToVaga = async (vagaId: string): Promise<boolean> => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para se candidatar.');
      return false;
    }

    // Regra de negócio: Somente perfil Estudante ou Técnico podem se candidatar
    const userRole = user.role.toLowerCase();
    const isAllowed = userRole.includes('estudante') || userRole.includes('técnico') || userRole.includes('tecnico') || userRole.includes('admin');
    
    if (!isAllowed) {
      Alert.alert(
        'Acesso Negado',
        'Regra de Negócio: Somente usuários com perfil Estudante ou Técnico podem se candidatar às vagas.'
      );
      return false;
    }

    setIsSubmitting(true);
    try {
      const newApp = await oportunidadesService.apply(vagaId, 'mock-token');
      
      // Atualiza lista local de candidaturas
      setCandidaturas((prev) => [newApp, ...prev]);

      // Simulação da Regra de Negócio: NotificationModule.publish(NOVA_CANDIDATURA)
      // Mostra notificação push local em formato de banner de sucesso
      Alert.alert(
        'Candidatura Enviada! 🚀',
        `Sua candidatura foi registrada com sucesso!\nO Produtor Rural foi notificado via Push Notification (FCM).`
      );
      
      return true;
    } catch (e: any) {
      const msg = e.response?.data?.detail || e.message || 'Erro ao realizar candidatura.';
      Alert.alert('Erro', msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── CREATE VACANCY ─────────────────────────────────────────────────────────
  const createVacancy = async (vagaData: {
    title: string;
    description: string;
    region: string;
    culture: string;
    vacancy_type: 'Estágio' | 'Emprego' | 'Freelance';
    salary: string;
    duration: string;
    expires_at: string;
  }): Promise<boolean> => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para criar uma vaga.');
      return false;
    }

    // Regra de negócio: Somente perfil Produtor pode cadastrar vagas
    const userRole = user.role.toLowerCase();
    const isAllowed = userRole.includes('produtor') || userRole.includes('admin');
    
    if (!isAllowed) {
      Alert.alert(
        'Acesso Negado',
        'Regra de Negócio: Somente usuários com perfil Produtor Rural podem cadastrar novas vagas.'
      );
      return false;
    }

    setIsSubmitting(true);
    try {
      const newVaga = await oportunidadesService.create(vagaData, 'mock-token');
      // Adiciona no topo da lista local de vagas
      setVagas((prev) => [newVaga, ...prev]);
      Alert.alert('Sucesso 🎉', 'Vaga cadastrada com sucesso! Estudantes e profissionais na região serão notificados.');
      return true;
    } catch (e: any) {
      const msg = e.response?.data?.detail || e.message || 'Erro ao cadastrar vaga.';
      Alert.alert('Erro', msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Carrega inicialmente
  useEffect(() => {
    fetchVacancies(filters);
    fetchApplications();
  }, [fetchVacancies, fetchApplications]);

  // Atualiza busca por região ao parar de digitar
  const searchByRegion = (regionText: string) => {
    const nextFilters = { ...filters, region: regionText };
    setFilters(nextFilters);
    fetchVacancies(nextFilters);
  };

  // Atualiza por categoria
  const updateCategoryFilter = (categoryType: 'culture' | 'vacancy_type', value: string) => {
    const nextFilters = { ...filters, [categoryType]: value };
    setFilters(nextFilters);
    fetchVacancies(nextFilters);
  };

  const refresh = () => {
    fetchVacancies(filters);
    fetchApplications();
  };

  return {
    vagas,
    candidaturas,
    filters,
    isLoading,
    isSubmitting,
    error,
    searchByRegion,
    updateCategoryFilter,
    applyToVaga,
    createVacancy,
    refresh,
  };
}
