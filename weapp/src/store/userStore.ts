import type { User } from '../types';

const STORAGE_KEY = 'fitness_user';
const ADMIN_OPEN_IDS = ['admin_openid_1', 'admin_openid_2'];

class UserStore {
  private user: User | null = null;
  private users: User[] = [];

  constructor() {
    this.loadFromStorage();
    this.loadUsersFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = wx.getStorageSync(STORAGE_KEY);
      if (stored) {
        this.user = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load user from storage:', e);
    }
  }

  private loadUsersFromStorage() {
    try {
      const stored = wx.getStorageSync('fitness_users');
      if (stored) {
        this.users = JSON.parse(stored);
      } else {
        this.users = this.getDefaultUsers();
        this.saveUsersToStorage();
      }
    } catch (e) {
      console.error('Failed to load users from storage:', e);
      this.users = this.getDefaultUsers();
    }
  }

  private saveToStorage() {
    try {
      wx.setStorageSync(STORAGE_KEY, JSON.stringify(this.user));
    } catch (e) {
      console.error('Failed to save user to storage:', e);
    }
  }

  private saveUsersToStorage() {
    try {
      wx.setStorageSync('fitness_users', JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to save users to storage:', e);
    }
  }

  private getDefaultUsers(): User[] {
    return [
      {
        id: 'admin_1',
        openId: 'admin_openid_1',
        nickname: '管理员',
        avatarUrl: '',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
    ];
  }

  getUser(): User | null {
    return this.user;
  }

  getUsers(): User[] {
    return this.users;
  }

  getIsLoggedIn(): boolean {
    return this.user !== null;
  }

  getIsAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  async login() {
    try {
      const res = await wx.login({});
      const { code } = res;

      const mockOpenId = `mock_openid_${Date.now()}`;
      
      let existingUser = this.users.find((u) => u.openId === mockOpenId);
      
      if (!existingUser) {
        existingUser = {
          id: `user_${Date.now()}`,
          openId: mockOpenId,
          nickname: '用户',
          avatarUrl: '',
          role: ADMIN_OPEN_IDS.includes(mockOpenId) ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        this.users.push(existingUser);
        this.saveUsersToStorage();
      } else {
        existingUser.lastLoginAt = new Date().toISOString();
        this.saveUsersToStorage();
      }

      this.user = existingUser;
      this.saveToStorage();

      return { success: true, user: existingUser };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: '登录失败' };
    }
  }

  async loginWithWechat() {
    try {
      const loginRes = await wx.login({});
      const { code } = loginRes;

      const userInfoRes = await wx.getUserProfile({
        desc: '用于登录和展示用户信息',
      });

      const { userInfo } = userInfoRes;
      const mockOpenId = `wechat_openid_${Date.now()}`;

      let existingUser = this.users.find((u) => u.openId === mockOpenId);

      if (!existingUser) {
        existingUser = {
          id: `user_${Date.now()}`,
          openId: mockOpenId,
          nickname: userInfo.nickName || '用户',
          avatarUrl: userInfo.avatarUrl || '',
          role: ADMIN_OPEN_IDS.includes(mockOpenId) ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        this.users.push(existingUser);
        this.saveUsersToStorage();
      } else {
        existingUser.nickname = userInfo.nickName || existingUser.nickname;
        existingUser.avatarUrl = userInfo.avatarUrl || existingUser.avatarUrl;
        existingUser.lastLoginAt = new Date().toISOString();
        this.saveUsersToStorage();
      }

      this.user = existingUser;
      this.saveToStorage();

      return { success: true, user: existingUser };
    } catch (error: any) {
      console.error('WeChat login failed:', error);
      return { success: false, message: error.message || '微信登录失败' };
    }
  }

  logout() {
    this.user = null;
    this.saveToStorage();
  }

  updateUser(user: Partial<User>) {
    if (this.user) {
      this.user = { ...this.user, ...user };
      this.saveToStorage();

      const index = this.users.findIndex((u) => u.id === this.user!.id);
      if (index !== -1) {
        this.users[index] = this.user;
        this.saveUsersToStorage();
      }
    }
  }

  updateUserRole(userId: string, role: 'user' | 'admin') {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.users[index].role = role;
      this.saveUsersToStorage();

      if (this.user?.id === userId) {
        this.user.role = role;
        this.saveToStorage();
      }
    }
  }

  deleteUser(userId: string) {
    this.users = this.users.filter((u) => u.id !== userId);
    this.saveUsersToStorage();
  }
}

const userStore = new UserStore();
export default userStore;
