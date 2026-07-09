import { Vaga, Candidatura } from '../../domain/entities/vaga.types';
import { IOportunidadesRepository } from '../../domain/repositories/OportunidadesRepository';
import { get, post } from '../../infrastructure/api/api';

// ─── LOCAL MOCK STATE ─────────────────────────────────────────────────────────
// Em caso de falha de conexão (ex: servidor Django offline), o aplicativo
// utiliza essa memória local para garantir que a demonstração funcione perfeitamente.

let LOCAL_VACANCIES: Vaga[] = [
  {
    id: 'vaga-1',
    title: 'Estágio em Monitoramento de Pragas (Soja)',
    description: 'Acompanhamento e monitoramento de pragas e doenças na soja. Levantamento de dados de campo e elaboração de relatórios técnicos de manejo.',
    region: 'Teresina',
    culture: 'Soja',
    vacancy_type: 'Estágio',
    salary: 'R$ 1.400,00 / mês',
    duration: '6 meses',
    producer_id: 'demo-joao.agro',
    producer_name: 'João Agricultor',
    expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    latitude: -5.0782,
    longitude: -42.7712,
  },
  {
    id: 'vaga-2',
    title: 'Estagiário em Irrigação e Solo (Milho)',
    description: 'Auxílio no manejo de sistemas de gotejamento, coleta de amostras de solo, medição de umidade e apoio no desenvolvimento da lavoura de milho.',
    region: 'Teresina',
    culture: 'Milho',
    vacancy_type: 'Estágio',
    salary: 'R$ 1.200,00',
    duration: '6 meses',
    producer_id: 'demo-joao.agro',
    producer_name: 'João Agricultor',
    expires_at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    latitude: -5.1221,
    longitude: -42.8021,
  },
  {
    id: 'vaga-3',
    title: 'Consultoria Freelance em Fitopatologia',
    description: 'Vistoria pontual em plantação de milho na região de Teresina para identificação de ferrugem comum e recomendação de tratamento fitossanitário.',
    region: 'Teresina',
    culture: 'Milho',
    vacancy_type: 'Freelance',
    salary: 'R$ 800,00 / diária',
    duration: '2 dias',
    producer_id: 'prod-456',
    producer_name: 'AgroConsultores PI',
    expires_at: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    latitude: -5.0591,
    longitude: -42.8123,
  },
  {
    id: 'vaga-4',
    title: 'Estágio em Fruticultura (Caju)',
    description: 'Acompanhamento do cultivo de cajueiro anão precoce. Monitoramento de pragas e apoio técnico nas atividades de colheita e pós-colheita.',
    region: 'Floriano',
    culture: 'Caju',
    vacancy_type: 'Estágio',
    salary: 'R$ 1.300,00 / mês',
    duration: '6 meses',
    producer_id: 'prod-789',
    producer_name: 'Pomar Sul Piauí',
    expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    latitude: -6.7669,
    longitude: -43.0225,
  },
  {
    id: 'vaga-5',
    title: 'Técnico Agrícola - Hortaliças',
    description: 'Vaga efetiva CLT para gerenciamento de produção de hortaliças em Floriano. Coordenação de equipes de campo e controle de insumos.',
    region: 'Floriano',
    culture: 'Hortaliças',
    vacancy_type: 'Emprego',
    salary: 'R$ 3.200,00 / mês',
    duration: 'Indeterminado (CLT)',
    producer_id: 'prod-789',
    producer_name: 'Fazenda Vale do Gurgueia',
    expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    latitude: -6.7451,
    longitude: -43.0031,
  },
  {
    id: 'vaga-6',
    title: 'Assistente Técnico de Campo (Algodão)',
    description: 'Buscamos profissional técnico para acompanhamento diário de lavoura de algodão orgânico em Parnaíba. Elaboração de relatórios.',
    region: 'Parnaíba',
    culture: 'Algodão',
    vacancy_type: 'Estágio',
    salary: 'R$ 1.500,00 / mês',
    duration: '12 meses',
    producer_id: 'prod-999',
    producer_name: 'Algodão Delta do Parnaíba',
    expires_at: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    latitude: -2.9098,
    longitude: -41.7766,
  },
];

let LOCAL_APPLICATIONS: Candidatura[] = [];

let CURRENT_MOCK_USER = {
  id: 'demo-joao.agro',
  name: 'João',
  role: 'Produtor Rural',
};

export function setOpportunitiesMockUser(user: { id: string; name: string; role: string }) {
  CURRENT_MOCK_USER = user;
}

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

    const alreadyApplied = LOCAL_APPLICATIONS.some(
      (app) => app.opportunity_id === vacancyId && app.user_id === CURRENT_MOCK_USER.id
    );
    if (alreadyApplied) {
      throw new Error('Você já se candidatou a esta vaga.');
    }

    // Simula a criação da candidatura
    const newApp: Candidatura = {
      id: `app-demo-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      opportunity_id: vacancyId,
      user_id: CURRENT_MOCK_USER.id,
      user_name: CURRENT_MOCK_USER.name,
      user_role: CURRENT_MOCK_USER.role,
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

    // Fallback local: cria vaga fictícia com coordenadas inferidas pela cidade
    let lat = -5.0892;
    let lng = -42.8016;
    const regionLower = vagaData.region.toLowerCase();
    
    if (regionLower.includes('floriano')) {
      lat = -6.7669;
      lng = -43.0225;
    } else if (regionLower.includes('parnaiba') || regionLower.includes('parnaíba')) {
      lat = -2.9098;
      lng = -41.7766;
    }
    
    // Adiciona pequena variação para não sobrepor
    lat += (Math.random() - 0.5) * 0.05;
    lng += (Math.random() - 0.5) * 0.05;

    const newVaga: Vaga = {
      ...vagaData,
      id: `vaga-demo-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      producer_id: CURRENT_MOCK_USER.id,
      producer_name: `${CURRENT_MOCK_USER.name} Empreendimentos`,
      created_at: new Date().toISOString(),
      latitude: lat,
      longitude: lng,
    };

    LOCAL_VACANCIES.unshift(newVaga);
    return newVaga;
  }

  async getApplications(_token: string): Promise<Candidatura[]> {
    try {
      const data = await get('/opportunities/applications');
      if (Array.isArray(data)) {
        LOCAL_APPLICATIONS = data;
      }
    } catch (e) {
      console.log('Backend indisponível, carregando candidaturas locais...');
    }

    if (CURRENT_MOCK_USER.role === 'Produtor Rural') {
      const myVacancyIds = LOCAL_VACANCIES
        .filter((v) => v.producer_id === CURRENT_MOCK_USER.id)
        .map((v) => v.id);
      return LOCAL_APPLICATIONS.filter((app) => myVacancyIds.includes(app.opportunity_id));
    }

    return LOCAL_APPLICATIONS.filter((app) => app.user_id === CURRENT_MOCK_USER.id);
  }
}

export const oportunidadesService = new OportunidadesService();
