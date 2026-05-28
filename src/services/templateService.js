import api from '../lib/api';

export const templateService = {
  async getTemplates(params = {}) {
    return api.get('/templates', params);
  },

  async getTemplate(id) {
    return api.get(`/templates/${id}`);
  },

  async createTemplate(data) {
    return api.post('/templates', data);
  },

  async updateTemplate(id, data) {
    return api.put(`/templates/${id}`, data);
  },

  async deleteTemplate(id) {
    return api.delete(`/templates/${id}`);
  },

  async useTemplate(id) {
    return api.post(`/templates/${id}/use`);
  }
};

export default templateService;
