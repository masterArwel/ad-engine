/**
 * 用户管理相关 API 服务
 */

import { request } from '../utils/request';
import type { UserInfo, PaginationParams, PaginationResponse, ApiResponse, UploadResponse } from '../types/api';

/**
 * 用户查询参数
 */
export interface UserQueryParams extends PaginationParams {
  username?: string /** 用户名 */;
  nickname?: string /** 昵称 */;
  email?: string /** 邮箱 */;
  phone?: string /** 手机号 */;
  status?: number /** 状态 */;
  roleId?: string /** 角色ID */;
  createTimeStart?: string /** 创建时间开始 */;
  createTimeEnd?: string /** 创建时间结束 */;
}

/**
 * 用户创建/更新参数
 */
export interface UserFormData {
  username: string /** 用户名 */;
  nickname?: string /** 昵称 */;
  email?: string /** 邮箱 */;
  phone?: string /** 手机号 */;
  avatar?: string /** 头像 */;
  password?: string /** 密码 */;
  status: number /** 状态 */;
  roleIds?: string[] /** 角色ID列表 */;
  remark?: string /** 备注 */;
}

/**
 * 用户 API 服务
 */
export const userApi = {
  /**
   * 获取用户列表
   * @param params 查询参数
   */
  getUserList(params?: UserQueryParams): Promise<ApiResponse<PaginationResponse<UserInfo>>> {
    return request<PaginationResponse<UserInfo>>({
      url: '/users',
      method: 'GET',
      params: {
        pageNum: 1,
        pageSize: 10,
        ...params,
      },
    });
  },

  /**
   * 根据ID获取用户详情
   * @param id 用户ID
   */
  getUserById(id: string): Promise<ApiResponse<UserInfo>> {
    return request<UserInfo>({
      url: `/users/${id}`,
      method: 'GET',
    });
  },

  /**
   * 创建用户
   * @param data 用户数据
   */
  createUser(data: UserFormData): Promise<ApiResponse<UserInfo>> {
    return request<UserInfo>({
      url: '/users',
      method: 'POST',
      data,
    });
  },

  /**
   * 更新用户
   * @param id 用户ID
   * @param data 用户数据
   */
  updateUser(id: string, data: Partial<UserFormData>): Promise<ApiResponse<UserInfo>> {
    return request<UserInfo>({
      url: `/users/${id}`,
      method: 'PUT',
      data,
    });
  },

  /**
   * 删除用户
   * @param id 用户ID
   */
  deleteUser(id: string): Promise<ApiResponse<void>> {
    return request<void>({
      url: `/users/${id}`,
      method: 'DELETE',
    });
  },

  /**
   * 批量删除用户
   * @param ids 用户ID列表
   */
  batchDeleteUsers(ids: string[]): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/users/batch',
      method: 'DELETE',
      data: { ids },
    });
  },

  /**
   * 启用/禁用用户
   * @param id 用户ID
   * @param status 状态：1-启用，0-禁用
   */
  updateUserStatus(id: string, status: number): Promise<ApiResponse<void>> {
    return request<void>({
      url: `/users/${id}/status`,
      method: 'PATCH',
      data: { status },
    });
  },

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param newPassword 新密码
   */
  resetUserPassword(id: string, newPassword: string): Promise<ApiResponse<void>> {
    return request<void>({
      url: `/users/${id}/reset-password`,
      method: 'POST',
      data: { newPassword },
    });
  },

  /**
   * 更新用户头像
   * @param id 用户ID
   * @param file 头像文件
   */
  updateUserAvatar(id: string, file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return request<UploadResponse>({
      url: `/users/${id}/avatar`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 获取用户权限列表
   * @param id 用户ID
   */
  getUserPermissions(id: string): Promise<ApiResponse<string[]>> {
    return request<string[]>({
      url: `/users/${id}/permissions`,
      method: 'GET',
    });
  },

  /**
   * 更新用户权限
   * @param id 用户ID
   * @param permissions 权限列表
   */
  updateUserPermissions(id: string, permissions: string[]): Promise<ApiResponse<void>> {
    return request<void>({
      url: `/users/${id}/permissions`,
      method: 'PUT',
      data: { permissions },
    });
  },

  /**
   * 导出用户列表
   * @param params 查询参数
   */
  exportUsers(params?: UserQueryParams): Promise<void> {
    return request<Blob>({
      url: '/users/export',
      method: 'GET',
      params,
    }).then(() => {
      // 下载逻辑在 request 工具中处理
    });
  },

  /**
   * 导入用户
   * @param file Excel 文件
   */
  importUsers(file: File): Promise<ApiResponse<{ successCount: number; failCount: number; errors?: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);

    return request<{ successCount: number; failCount: number; errors?: string[] }>({
      url: '/users/import',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 检查用户名是否存在
   * @param username 用户名
   * @param excludeId 排除的用户ID（用于编辑时检查）
   */
  checkUsername(username: string, excludeId?: string): Promise<ApiResponse<{ exists: boolean }>> {
    return request<{ exists: boolean }>({
      url: '/users/check-username',
      method: 'GET',
      params: { username, excludeId },
    });
  },

  /**
   * 检查邮箱是否存在
   * @param email 邮箱
   * @param excludeId 排除的用户ID
   */
  checkEmail(email: string, excludeId?: string): Promise<ApiResponse<{ exists: boolean }>> {
    return request<{ exists: boolean }>({
      url: '/users/check-email',
      method: 'GET',
      params: { email, excludeId },
    });
  },

  /**
   * 检查手机号是否存在
   * @param phone 手机号
   * @param excludeId 排除的用户ID
   */
  checkPhone(phone: string, excludeId?: string): Promise<ApiResponse<{ exists: boolean }>> {
    return request<{ exists: boolean }>({
      url: '/users/check-phone',
      method: 'GET',
      params: { phone, excludeId },
    });
  },
};


