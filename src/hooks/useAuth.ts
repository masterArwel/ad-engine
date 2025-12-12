/**
 * 认证状态管理 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getGlobalState, setGlobalState, onGlobalStateChange } from '../config/qiankun';
import { authService } from '../services/auth';
import type { 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData, 
  ChangePasswordData,
  UpdateUserData,
  UserInfo,
  AuthState 
} from '../types/auth';

/**
 * 认证 Hook 返回值接口
 */
export interface UseAuthReturn {
  /** 认证状态 */
  auth: AuthState;
  /** 登录方法 */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  /** 注册方法 */
  register: (userData: RegisterData) => Promise<boolean>;
  /** 退出登录方法 */
  logout: () => Promise<void>;
  /** 发送重置密码验证码 */
  sendResetCode: (email: string) => Promise<boolean>;
  /** 重置密码 */
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;
  /** 修改密码 */
  changePassword: (data: ChangePasswordData) => Promise<boolean>;
  /** 更新用户信息 */
  updateUserInfo: (userData: UpdateUserData) => Promise<boolean>;
  /** 上传头像 */
  uploadAvatar: (file: File) => Promise<string | null>;
  /** 刷新用户信息 */
  refreshUserInfo: () => Promise<void>;
  /** 初始化认证状态 */
  initAuth: () => Promise<void>;
}

/**
 * 认证状态管理 Hook
 */
export const useAuth = (): UseAuthReturn => {
  const [auth, setAuth] = useState<AuthState>(getGlobalState().auth);

  // 监听全局状态变化
  useEffect(() => {
    const dispose = onGlobalStateChange((state) => {
      if (state.auth) {
        setAuth(state.auth);
      }
    });

    return dispose;
  }, []);

  /** 更新认证状态 */
  const updateAuthState = useCallback((newAuthState: Partial<AuthState>) => {
    setAuth(prevAuth => {
      const updatedAuth = { ...prevAuth, ...newAuthState };
      setGlobalState({ auth: updatedAuth });
      return updatedAuth;
    });
  }, []);

  /** 登录 */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      updateAuthState({ loading: true });
      
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // 存储 Token
        authService.setToken(token);
        
        // 更新全局状态
        updateAuthState({
          isAuthenticated: true,
          user,
          token,
          loading: false,
        });
        
        message.success('登录成功');
        return true;
      } else {
        message.error(response.message || '登录失败');
        updateAuthState({ loading: false });
        return false;
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录失败，请稍后重试');
      updateAuthState({ loading: false });
      return false;
    }
  }, [updateAuthState]);

  /** 注册 */
  const register = useCallback(async (userData: RegisterData): Promise<boolean> => {
    try {
      updateAuthState({ loading: true });
      
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // 存储 Token
        authService.setToken(token);
        
        // 更新全局状态
        updateAuthState({
          isAuthenticated: true,
          user,
          token,
          loading: false,
        });
        
        message.success('注册成功');
        return true;
      } else {
        message.error(response.message || '注册失败');
        updateAuthState({ loading: false });
        return false;
      }
    } catch (error) {
      console.error('注册错误:', error);
      message.error('注册失败，请稍后重试');
      updateAuthState({ loading: false });
      return false;
    }
  }, [updateAuthState]);

  /** 退出登录 */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
      
      // 清除 Token
      authService.clearToken();
      
      // 重置认证状态
      updateAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      });
      
      message.success('已退出登录');
    } catch (error) {
      console.error('退出登录错误:', error);
      // 即使 API 调用失败，也要清除本地状态
      authService.clearToken();
      updateAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      });
    }
  }, [updateAuthState]);

  /** 发送重置密码验证码 */
  const sendResetCode = useCallback(async (email: string): Promise<boolean> => {
    try {
      const response = await authService.sendResetCode(email);
      
      if (response.success) {
        message.success(response.message || '验证码已发送');
        return true;
      } else {
        message.error(response.message || '发送失败');
        return false;
      }
    } catch (error) {
      console.error('发送验证码错误:', error);
      message.error('发送失败，请稍后重试');
      return false;
    }
  }, []);

  /** 重置密码 */
  const resetPassword = useCallback(async (data: ResetPasswordData): Promise<boolean> => {
    try {
      const response = await authService.resetPassword(data);
      
      if (response.success) {
        message.success(response.message || '密码重置成功');
        return true;
      } else {
        message.error(response.message || '重置失败');
        return false;
      }
    } catch (error) {
      console.error('重置密码错误:', error);
      message.error('重置失败，请稍后重试');
      return false;
    }
  }, []);

  /** 修改密码 */
  const changePassword = useCallback(async (data: ChangePasswordData): Promise<boolean> => {
    try {
      const response = await authService.changePassword(data);
      
      if (response.success) {
        message.success(response.message || '密码修改成功');
        return true;
      } else {
        message.error(response.message || '修改失败');
        return false;
      }
    } catch (error) {
      console.error('修改密码错误:', error);
      message.error('修改失败，请稍后重试');
      return false;
    }
  }, []);

  /** 更新用户信息 */
  const updateUserInfo = useCallback(async (userData: UpdateUserData): Promise<boolean> => {
    try {
      updateAuthState({ loading: true });
      
      const response = await authService.updateUserInfo(userData);
      
      if (response.success && response.data) {
        // 更新全局状态中的用户信息
        updateAuthState({
          user: response.data,
          loading: false,
        });
        
        message.success(response.message || '更新成功');
        return true;
      } else {
        message.error(response.message || '更新失败');
        updateAuthState({ loading: false });
        return false;
      }
    } catch (error) {
      console.error('更新用户信息错误:', error);
      message.error('更新失败，请稍后重试');
      updateAuthState({ loading: false });
      return false;
    }
  }, [updateAuthState]);

  /** 上传头像 */
  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    try {
      const response = await authService.uploadAvatar(file);
      
      if (response.success && response.data) {
        const avatarUrl = response.data.avatarUrl;
        
        // 更新用户信息中的头像
        setAuth(prevAuth => {
          if (prevAuth.user) {
            const updatedAuth = { ...prevAuth, user: { ...prevAuth.user, avatar: avatarUrl } };
            setGlobalState({ auth: updatedAuth });
            return updatedAuth;
          }
          return prevAuth;
        });
        
        message.success('头像上传成功');
        return avatarUrl;
      } else {
        message.error(response.message || '上传失败');
        return null;
      }
    } catch (error) {
      console.error('上传头像错误:', error);
      message.error('上传失败，请稍后重试');
      return null;
    }
  }, [updateAuthState]);

  /** 刷新用户信息 */
  const refreshUserInfo = useCallback(async (): Promise<void> => {
    try {
      const token = authService.getStoredToken();
      if (!token) return;

      const response = await authService.getUserInfo(token);
      
      if (response.success && response.data) {
        updateAuthState({ user: response.data });
      }
    } catch (error) {
      console.error('刷新用户信息错误:', error);
    }
  }, [updateAuthState]);

  /** 初始化认证状态 */
  const initAuth = useCallback(async (): Promise<void> => {
    try {
      const token = authService.getStoredToken();
      
      if (!token || authService.isTokenExpired(token)) {
        // Token 不存在或已过期，清除状态
        authService.clearToken();
        updateAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        });
        return;
      }

      // Token 有效，获取用户信息
      updateAuthState({ loading: true });
      
      const response = await authService.getUserInfo(token);
      
      if (response.success && response.data) {
        updateAuthState({
          isAuthenticated: true,
          user: response.data,
          token,
          loading: false,
        });
      } else {
        // 获取用户信息失败，清除状态
        authService.clearToken();
        updateAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('初始化认证状态错误:', error);
      authService.clearToken();
      updateAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      });
    }
  }, [updateAuthState]);

  return {
    auth,
    login,
    register,
    logout,
    sendResetCode,
    resetPassword,
    changePassword,
    updateUserInfo,
    uploadAvatar,
    refreshUserInfo,
    initAuth,
  };
};
