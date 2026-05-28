const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = '';
  }

  init() {
    try {
      this.token = wx.getStorageSync('token') || '';
    } catch (e) {
      console.error('获取 token 失败', e);
    }
  }

  setToken(token) {
    this.token = token;
    try {
      if (token) {
        wx.setStorageSync('token', token);
      } else {
        wx.removeStorageSync('token');
      }
    } catch (e) {
      console.error('保存 token 失败', e);
    }
  }

  getToken() {
    if (!this.token) {
      this.init();
    }
    return this.token;
  }

  request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: options.method || 'GET',
        data: options.body,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers
        },
        success: (res) => {
          if (res.statusCode === 401) {
            this.setToken(null);
            wx.navigateTo({ url: '/pages/login/index' });
            reject(new Error('请先登录'));
            return;
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(res.data?.message || '请求失败'));
          }
        },
        fail: (err) => {
          console.error('请求失败', err);
          reject(err);
        }
      });
    });
  }

  get(endpoint, params = {}) {
    let url = endpoint;
    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    if (queryString) {
      url = `${endpoint}?${queryString}`;
    }

    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiService = new ApiService();
export default apiService;
