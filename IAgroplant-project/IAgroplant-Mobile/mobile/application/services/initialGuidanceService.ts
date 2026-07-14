import { get, patch } from '../../infrastructure/api/api';

export type InitialGuidanceStatus = {
  user_id: string;
  role: string;
  completed: boolean;
};

let LOCAL_STATUS: InitialGuidanceStatus = {
  user_id: 'demo-user',
  role: 'Produtor Rural',
  completed: false,
};

export class InitialGuidanceService {

  async getStatus(): Promise<InitialGuidanceStatus> {
    try {
      const data = await get('/users/me/onboarding');
      LOCAL_STATUS = data;
      return data;
    } catch (error: any) {
      if (error.response) {
        throw error;
      }

      return LOCAL_STATUS;
    }
  }

  async complete(): Promise<InitialGuidanceStatus> {
    try {
      const data = await patch('/users/me/onboarding');
      LOCAL_STATUS = data;
      return data;
    } catch (error: any) {
      if (error.response) {
        throw error;
      }

      LOCAL_STATUS = {
        ...LOCAL_STATUS,
        completed: true,
      };
      return LOCAL_STATUS;
    }
  }
}

export const initialGuidanceService = new InitialGuidanceService();
