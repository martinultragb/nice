import type { User } from '../types';

// 简化版用户 store，无登录逻辑，直接返回默认用户
const defaultUser: User = {
  id: 'local_user',
  openId: 'local_user',
  nickname: '健身用户',
  avatarUrl: '',
  role: 'user',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

class UserStore {
  getUser(): User | null {
    return defaultUser;
  }

  getUsers(): User[] {
    return [defaultUser];
  }

  getIsLoggedIn(): boolean {
    return true; // 始终认为已登录
  }

  getIsAdmin(): boolean {
    return false;
  }

  login() {
    return { success: true, user: defaultUser };
  }

  loginWithWechat() {
    return { success: true, user: defaultUser };
  }

  logout() {
    // 空实现
  }

  updateUser() {
    // 空实现
  }

  updateUserRole() {
    // 空实现
  }

  deleteUser() {
    // 空实现
  }
}

const userStore = new UserStore();
export default userStore;
