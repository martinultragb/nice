import api from '../../utils/api';

export const statsService = {
  async getWeeklyStats() {
    return api.get('/stats/weekly');
  },

  async getMonthlyStats() {
    return api.get('/stats/monthly');
  },

  async getSummary() {
    return api.get('/stats/summary');
  }
};

export default statsService;
