import { Vaga, Candidatura } from '../../domain/entities/vaga.types';
import { IOportunidadesRepository } from '../../domain/repositories/OportunidadesRepository';
import { get, post } from '../../infrastructure/api/api';

// ─── LOCAL MOCK STATE ─────────────────────────────────────────────────────────
// Em caso de falha de conexão (ex: servidor Django offline), o aplicativo
// utiliza essa memória local para garantir que a demonstração funcione perfeitamente.

let LOCAL_VACANCIES: Vaga[] = [
  {
    id: 'vaga-1',
    title: 'Estágio em Manejo de Grãos',
    description: 'Acompanhamento de lavoura de soja e milho. Auxílio no monitoramento de pragas e doenças, amostragem de solo e relatórios semanais.',
    region: 'Mato Grosso',
    culture: 'Soja',
    vacancy_type: 'Estágio',
    salary: 'R$ 1.500,00 / mês',
    duration: '6 meses',
    producer_id: 'prod-123',
    producer_name: 'Fazenda Boa Vista',
    expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'vaga-2',
    title: 'Agrônomo de Campo Pleno',
    description: 'Buscamos agrônomo com CREA ativo para consultoria técnica direta aos produtores, recomendações de plantio e receituário agronômico.',
    region: 'Goiás',
    culture: 'Milho',
    vacancy_type: 'Emprego',
    salary: 'R$ 6.200,00 + Bônus',
    duration: 'CLT (Indeterminado)',
    producer_id: 'prod-456',
    producer_name: 'Sementes Cerrado',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'vaga-3',
    title: 'Consultoria e Vistoria Fitossanitária',
    description: 'Serviço pontual para vistoria técnica de 50 hectares de cultivo de café com suspeita de ferrugem da folha. Emissão de laudo.',
    region: 'Minas Gerais',
    culture: 'Café',
    vacancy_type: 'Freelance',
    salary: 'R$ 1.200,00 / diária',
    duration: '3 dias',
    producer_id: 'prod-123',
    producer_name: 'Fazenda Boa Vista',
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let LOCAL_APPLICATIONS: Candidatura[] = [];

// ─── IMPLEMENTATION ───────────────────────────────────────────────────────────

export class OportunidadesService implements IOportunidadesRepository {
  
  async getAll(filters: { region?: string; culture?: string; vacancy_type?: string }): Promise<Vaga[]> {
    try {
      // Faz chamada HTTP ao backend Django
      const params = {
        region: filters.region || undefined,
        culture: filters.culture || undefined,
        vacancy_type: filters.vacancy_type || undefined,
      };
      const data = await get('/opportunities', params);
      
      // Atualiza nossa cache em memória local se o backend retornar dados com sucesso
      if (Array.isArray(data)) {
        LOCAL_VACANCIES = data;
        return data;
      }
    } catch (e) {
      console.log('Backend indisponível, servindo dados locais de vagas...');
    }

    // Fallback: filtra localmente
    let filtered = [...LOCAL_VACANCIES];
    if (filters.region) {
      filtered = filtered.filter((v) => v.region.toLowerCase().includes(filters.region!.toLowerCase()));
    }
    if (filters.culture) {
      filtered = filtered.filter((v) => v.culture.toLowerCase().includes(filters.culture!.toLowerCase()));
    }
    if (filters.vacancy_type) {
      filtered = filtered.filter((v) => v.vacancy_type.toLowerCase() === filters.vacancy_type!.toLowerCase());
    }

    // Ocultar vagas expiradas
    filtered = filtered.filter((v) => new Date(v.expires_at) > new Date());

    return filtered;
  }

  async apply(vacancyId: string, _token: string): Promise<Candidatura> {
    try {
      // Chama o endpoint de candidatura do backend
      const response = await post(`/opportunities/${vacancyId}/apply`);
      if (response && response.id) {
        // Registra localmente se der certo
        const exists = LOCAL_APPLICATIONS.some((app) => app.id === response.id);
        if (!exists) LOCAL_APPLICATIONS.push(response);
        return response;
      }
    } catch (e) {
      console.log('Backend indisponível, simulando candidatura localmente...');
    }

    // Fallback local: encontra a vaga
    const vacancy = LOCAL_VACANCIES.find((v) => v.id === vacancyId);
    if (!vacancy) {
      throw new Error('Vaga não encontrada.');
    }

    if (new Date(vacancy.expires_at) <= new Date()) {
      throw new Error('Esta vaga já expirou.');
    }

    const alreadyApplied = LOCAL_APPLICATIONS.some((app) => app.opportunity_id === vacancyId);
    if (alreadyApplied) {
      throw new Error('Você já se candidatou a esta vaga.');
    }

    // Simula a criação da candidatura
    const newApp: Candidatura = {
      id: `app-demo-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      opportunity_id: vacancyId,
      user_id: 'demo-user',
      user_name: 'João Agricultor',
      user_role: 'Estudante',
      applied_at: new Date().toISOString(),
      status: 'Pendente',
      vacancy_title: vacancy.title,
      vacancy_region: vacancy.region,
      vacancy_culture: vacancy.culture,
    };

    LOCAL_APPLICATIONS.push(newApp);
    return newApp;
  }

  async create(vagaData: Omit<Vaga, 'id' | 'created_at' | 'producer_id' | 'producer_name'>, _token: string): Promise<Vaga> {
    try {
      const response = await post('/opportunities', vagaData);
      if (response && response.id) {
        LOCAL_VACANCIES.unshift(response);
        return response;
      }
    } catch (e) {
      console.log('Backend indisponível, registrando vaga localmente...');
    }

    // Fallback local: cria vaga fictícia
    const newVaga: Vaga = {
      ...vagaData,
      id: `vaga-demo-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      producer_id: 'demo-producer',
      producer_name: 'Fazenda Boa Vista', // Simula produtor ativo
      created_at: new Date().toISOString(),
    };

    LOCAL_VACANCIES.unshift(newVaga);
    return newVaga;
  }

  async getApplications(_token: string): Promise<Candidatura[]> {
    try {
      const data = await get('/opportunities/applications');
      if (Array.isArray(data)) {
        LOCAL_APPLICATIONS = data;
        return data;
      }
    } catch (e) {
      console.log('Backend indisponível, carregando candidaturas locais...');
    }

    return LOCAL_APPLICATIONS;
  }
}

export const oportunidadesService = new OportunidadesService();
