import api from '../../utils/api';

export const exerciseService = {
  async getExercises(params = {}) {
    return api.get('/exercises', params);
  },

  async getExercise(id) {
    return api.get(`/exercises/${id}`);
  },

  async createExercise(data) {
    return api.post('/exercises', data);
  },

  async updateExercise(id, data) {
    return api.put(`/exercises/${id}`, data);
  },

  async deleteExercise(id) {
    return api.delete(`/exercises/${id}`);
  }
};

export default exerciseService;
