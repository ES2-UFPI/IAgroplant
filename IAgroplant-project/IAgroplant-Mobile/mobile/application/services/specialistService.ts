import { Specialist } from '../../domain/entities/specialist.types';
import { get } from '../../infrastructure/api/api';

export async function searchSpecialists(
  topic: string,
  region?: string
): Promise<Specialist[]> {
  try {
    const data = await get('/specialists/search', {
      topic,
      ...(region ? { region } : {}),
    });
    if (Array.isArray(data)) {
      return data;
    }
  } catch (error: any) {
    console.log('Erro ao buscar especialistas...', error.response?.data || error.message);
    throw error;
  }
  return [];
}