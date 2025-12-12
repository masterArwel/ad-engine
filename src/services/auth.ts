/**
 * 认证相关 API 服务
 */

import type {
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateUserData,
  AuthResponse,
  UserInfo,
  ApiResponse,
  SendCodeResponse,
  UploadAvatarResponse,
} from '../types/auth';
import { mockAuthAPI } from '../bffData/auth';
import { mockConfig } from '../bffData';

/** 认证 API 服务类 */
class AuthService {
  /** 是否使用 Mock 数据 */
  private useMock = mockConfig.enabled;

  /** 
   * 用户登录
   * @param credentials 登录凭据
   * @returns 认证响应
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    if (this.useMock) {
      return mockAuthAPI.login(credentials.email, credentials.password);
    }
    
    // 真实 API 调用（暂时注释）
    // const response = await request.post('/api/auth/login', credentials);
    // return response.data;
    
    throw new Error('真实 API 未实现');
  }

  /**
   * 用户注册
   * @param userData 注册数据
   * @returns 认证响应
   */
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    if (this.useMock) {
      return mockAuthAPI.register(userData.email, userData.password, userData.name);
    }
    
    // 真实 API 调用（暂时注释）
    // const response = await request.post('/api/auth/register', userData);
    // return response.data;
    
    throw new Error('真实 API 未实现');
  }

  /**
   * 发送重置密码验证码
   * @param email 邮箱地址
   * @returns 发送结果
   */
  async sendResetCode(email: string): Promise<ApiResponse<SendCodeResponse>> {
    if (this.useMock) {
      return mockAuthAPI.sendResetCode(email);
    }
    
    // 真实 API 调用（暂时注释）
    // const response = await request.post('/api/auth/send-reset-code', { email });
    // return response.data;
    
    throw new Error('真实 API 未实现');
  }

  /**
   * 重置密码
   * @param data 重置密码数据
   * @returns 重置结果
   */
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<null>> {
    if (this.useMock) {
      return mockAuthAPI.resetPassword(data.email, data.code, data.newPassword);
    }
    
    // 真实 API 调用（暂时注释）
    // const response = await request.post('/api/auth/reset-password', data);
    // return response.data;
    
    throw new Error('真实 API 未实现');
  }

  /**
   * 获取用户信息
   * @param token JWT Token
   * @returns 用户信息
   */
  async getUserInfo(token?: string): Promise<ApiResponse<UserInfo>> {
    const authToken = token || this.getStoredToken();
    if (!authToken) {
      throw new Error('未找到认证 Token');
    }

    if (this.useMock) {
      return mockAuthAPI.getUserInfo(authToken);
    }
    
    // 真实 API 调用（暂时注释）
    // const response = await request.get('/api/auth/user-info', {
    //   headers: { Authorization: `Bearer ${authToken}` }
    // });
    // return response.data;
    
    throw new Error('真实 API 未实现');
  }

  /**
   * 更新用户信息
   * @param userData 用户数据
   * @returns 更新后的用户信息
   */
  async updateUserInfo(userData: UpdateUserData): Promise<ApiResponse<UserInfo>> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('未找到认证 Token');
    }

    if (this.useMock) {
      return mockAuthAPI.updateUserInfo(token, userData);
    }
    
    // 真实 API 调用（暂时注释）
    // const response = await request.put('/api/auth/user-info', userData, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    throw new Error('真实 API 未实现');
  }

  /**
   * 修改密码
   * @param data 修改密码数据
   * @returns 修改结果
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('未找到认证 Token');
    }

    if (this.useMock) {
      return mockAuthAPI.changePassword(token, data.oldPassword, data.newPassword);
    }
    
    // 真实 API 调用（暂时注释）
    // const response = await request.post('/api/auth/change-password', data, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    throw new Error('真实 API 未实现');
  }

  /**
   * 上传头像
   * @param file 头像文件
   * @returns 上传结果
   */
  async uploadAvatar(file: File): Promise<ApiResponse<UploadAvatarResponse>> {
    if (this.useMock) {
      return mockAuthAPI.uploadAvatar(file);
    }
    
    // 真实 API 调用（暂时注释）
    // const formData = new FormData();
    // formData.append('avatar', file);
    // const token = this.getStoredToken();
    // const response = await request.post('/api/auth/upload-avatar', formData, {
    //   headers: { 
    //     Authorization: `Bearer ${token}`,
    //     'Content-Type': 'multipart/form-data'
    //   }
    // });
    // return response.data;
    
    throw new Error('真实 API 未实现');
  }

  /**
   * 退出登录
   * @returns 退出结果
   */
  async logout(): Promise<ApiResponse<null>> {
    if (this.useMock) {
      return mockAuthAPI.logout();
    }
    
    // 真实 API 调用（暂时注释）
    // const token = this.getStoredToken();
    // const response = await request.post('/api/auth/logout', {}, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    throw new Error('真实 API 未实现');
  }

  /**
   * 存储 Token 到 localStorage
   * @param token JWT Token
   */
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * 从 localStorage 获取 Token
   * @returns JWT Token 或 null
   */
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * 清除存储的 Token
   */
  clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * 检查 Token 是否过期
   * @param token JWT Token
   * @returns 是否过期
   */
  isTokenExpired(token?: string): boolean {
    const authToken = token || this.getStoredToken();
    if (!authToken) return true;

    try {
      const parts = authToken.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;
      
      if (!exp) return true;
      
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * 检查用户是否已认证
   * @returns 是否已认证
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * 获取 Token 中的用户信息
   * @param token JWT Token
   * @returns 用户信息或 null
   */
  getTokenPayload(token?: string): any | null {
    const authToken = token || this.getStoredToken();
    if (!authToken) return null;

    try {
      const parts = authToken.split('.');
      if (parts.length !== 3) return null;
      
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }
}

/** 导出认证服务实例 */
export const authService = new AuthService();

/** 导出认证服务类（用于测试或自定义实例） */
export { AuthService };