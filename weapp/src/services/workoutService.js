import api from '../../utils/api';

export const workoutService = {
  async getWorkouts(params = {}) {
    return api.get('/workouts', params);
  },

  async getTodayWorkout() {
    return api.get('/workouts/today');
  },

  async getWorkoutByDate(date) {
    return api.get(`/workouts/date/${date}`);
  },

  async getWorkout(id) {
    return api.get(`/workouts/${id}`);
  },

  async createWorkout(data) {
    return api.post('/workouts', data);
  },

  async updateWorkout(id, data) {
    return api.put(`/workouts/${id}`, data);
  },

  async deleteWorkout(id) {
    return api.delete(`/workouts/${id}`);
  }
};

export default workoutService;
