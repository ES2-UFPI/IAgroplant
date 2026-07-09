export interface Vaga {
  id: string;
  title: string;
  description: string;
  region: string;
  culture: string;
  vacancy_type: 'Estágio' | 'Emprego' | 'Freelance';
  salary: string;
  duration: string;
  producer_id: string;
  producer_name: string;
  expires_at: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

export interface Candidatura {
  id: string;
  opportunity_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  applied_at: string;
  status: string;
  
  // Enriched fields for list displays
  vacancy_title?: string;
  vacancy_region?: string;
  vacancy_culture?: string;
}
