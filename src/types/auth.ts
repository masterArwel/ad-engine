/**
 * 认证相关类型定义
 */

/** 用户信息接口 */
export interface UserInfo {
  id: string /** 用户ID */;
  email: string /** 邮箱 */;
  name: string /** 姓名 */;
  avatar?: string /** 头像URL */;
  createdAt: string /** 创建时间 */;
  updatedAt: string /** 更新时间 */;
}

/** 登录请求参数 */
export interface LoginCredentials {
  email: string /** 邮箱 */;
  password: string /** 密码 */;
}

/** 注册请求参数 */
export interface RegisterData {
  email: string /** 邮箱 */;
  password: string /** 密码 */;
  name: string /** 姓名 */;
}

/** 认证响应数据 */
export interface AuthResponse {
  token: string /** JWT Token */;
  user: UserInfo /** 用户信息 */;
  expiresIn: number /** Token过期时间（秒） */;
}

/** 重置密码请求参数 */
export interface ResetPasswordData {
  email: string /** 邮箱 */;
  code: string /** 验证码 */;
  newPassword: string /** 新密码 */;
}

/** 修改密码请求参数 */
export interface ChangePasswordData {
  oldPassword: string /** 旧密码 */;
  newPassword: string /** 新密码 */;
}

/** 更新用户信息请求参数 */
export interface UpdateUserData {
  name?: string /** 姓名 */;
  avatar?: string /** 头像URL */;
}

/** 认证状态 */
export interface AuthState {
  isAuthenticated: boolean /** 是否已认证 */;
  user: UserInfo | null /** 用户信息 */;
  token: string | null /** JWT Token */;
  loading: boolean /** 加载状态 */;
}

/** API 响应基础结构 */
export interface ApiResponse<T = any> {
  code: number /** 响应码 */;
  message: string /** 响应消息 */;
  data: T /** 响应数据 */;
  success: boolean /** 是否成功 */;
}

/** 发送验证码响应 */
export interface SendCodeResponse {
  message: string /** 发送结果消息 */;
  expiresIn: number /** 验证码过期时间（秒） */;
}

/** 上传头像响应 */
export interface UploadAvatarResponse {
  avatarUrl: string /** 头像URL */;
}

/** 表单验证规则类型 */
export interface ValidationRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (rule: any, value: any) => Promise<void>;
}

/** 登录表单字段 */
export interface LoginFormFields {
  email: string;
  password: string;
  remember?: boolean;
}

/** 注册表单字段 */
export interface RegisterFormFields {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  agreement: boolean;
}

/** 重置密码表单字段 */
export interface ResetPasswordFormFields {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

/** 个人信息表单字段 */
export interface ProfileFormFields {
  name: string;
  email: string;
}

/** 修改密码表单字段 */
export interface ChangePasswordFormFields {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
