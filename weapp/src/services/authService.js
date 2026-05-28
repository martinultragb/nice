import api from '../../utils/api';

export const authService = {
  async login(openId, nickname, avatarUrl) {
    const response = await api.post('/auth/login', {
      openId,
      nickname,
      avatarUrl
    });

    if (response.success && response.data?.token) {
      api.setToken(response.data.token);
    }

    return response;
  },

  async register(openId, nickname, avatarUrl) {
    const response = await api.post('/auth/register', {
      openId,
      nickname,
      avatarUrl
    });

    if (response.success && response.data?.token) {
      api.setToken(response.data.token);
    }

    return response;
  },

  async getProfile() {
    return api.get('/auth/profile');
  },

  async updateProfile(data) {
    return api.put('/auth/profile', data);
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      api.setToken(null);
    }
  },

  isAuthenticated() {
    return !!api.getToken();
  },

  init() {
    api.init();
  }
};

export default authService;
