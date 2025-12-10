/**
 * 认证相关 API 服务
 */

import { request } from '../utils/request';
import type { LoginParams, LoginResponse, UserInfo, ApiResponse } from '../types/api';

/**
 * 认证 API 服务
 */
export const authApi = {
  /**
   * 用户登录
   * @param params 登录参数
   */
  login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
    return request<LoginResponse>({
      url: '/auth/login',
      method: 'POST',
      data: params,
    });
  },

  /**
   * 用户登出
   */
  logout(): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/auth/logout',
      method: 'POST',
    });
  },

  /**
   * 刷新 token
   * @param refreshToken 刷新令牌
   */
  refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    return request<{ token: string; expiresIn: number }>({
      url: '/auth/refresh',
      method: 'POST',
      data: { refreshToken },
    });
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    return request<UserInfo>({
      url: '/auth/me',
      method: 'GET',
    });
  },

  /**
   * 修改密码
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/auth/change-password',
      method: 'POST',
      data: { oldPassword, newPassword },
    });
  },

  /**
   * 发送验证码
   * @param phone 手机号
   * @param type 验证码类型：login-登录，register-注册，reset-重置密码
   */
  sendSmsCode(phone: string, type: 'login' | 'register' | 'reset'): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/auth/sms/send',
      method: 'POST',
      data: { phone, type },
    });
  },

  /**
   * 验证短信验证码
   * @param phone 手机号
   * @param code 验证码
   * @param type 验证码类型
   */
  verifySmsCode(phone: string, code: string, type: string): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/auth/sms/verify',
      method: 'POST',
      data: { phone, code, type },
    });
  },

  /**
   * 重置密码
   * @param phone 手机号
   * @param code 验证码
   * @param newPassword 新密码
   */
  resetPassword(phone: string, code: string, newPassword: string): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/auth/reset-password',
      method: 'POST',
      data: { phone, code, newPassword },
    });
  },

  /**
   * 获取图形验证码
   */
  getCaptcha(): Promise<ApiResponse<{ captchaId: string; captchaImage: string }>> {
    return request<{ captchaId: string; captchaImage: string }>({
      url: '/auth/captcha',
      method: 'GET',
    });
  },

  /**
   * 验证图形验证码
   * @param captchaId 验证码ID
   * @param captcha 验证码
   */
  verifyCaptcha(captchaId: string, captcha: string): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/auth/captcha/verify',
      method: 'POST',
      data: { captchaId, captcha },
    });
  },
};


