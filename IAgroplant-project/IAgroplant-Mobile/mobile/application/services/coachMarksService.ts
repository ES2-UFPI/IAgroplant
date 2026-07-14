import { get, patch } from '../../infrastructure/api/api';

export type CoachMarksStatus = {
  user_id: string;
  completed: boolean;
};

let LOCAL_STATUS: CoachMarksStatus = {
  user_id: 'demo-user',
  completed: false,
};

export class CoachMarksService {

  async getStatus(): Promise<CoachMarksStatus> {
    try {
      const data = await get('/users/me/coach-marks');
      LOCAL_STATUS = data;
      return data;
    } catch (error: any) {
      if (error.response) {
        throw error;
      }

      return LOCAL_STATUS;
    }
  }

  async complete(): Promise<CoachMarksStatus> {
    try {
      const data = await patch('/users/me/coach-marks');
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

export const coachMarksService = new CoachMarksService();
