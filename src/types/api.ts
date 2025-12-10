/**
 * API 相关类型定义
 */

/**
 * HTTP 请求方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number /** 响应状态码 */;
  message: string /** 响应消息 */;
  data: T /** 响应数据 */;
  success: boolean /** 请求是否成功 */;
  timestamp?: number /** 时间戳 */;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  pageNum?: number /** 页码，从1开始 */;
  pageSize?: number /** 每页大小 */;
}

/**
 * 分页响应数据
 */
export interface PaginationResponse<T = any> {
  list: T[] /** 数据列表 */;
  total: number /** 总数 */;
  pageNum: number /** 当前页码 */;
  pageSize: number /** 每页大小 */;
  totalPages: number /** 总页数 */;
}

/**
 * 请求配置
 */
export interface RequestConfig {
  url: string /** 请求地址 */;
  method?: HttpMethod /** 请求方法 */;
  params?: Record<string, any> /** URL 参数 */;
  data?: any /** 请求体数据 */;
  headers?: Record<string, string> /** 请求头 */;
  timeout?: number /** 超时时间 */;
  withCredentials?: boolean /** 是否携带凭证 */;
}

/**
 * 请求错误信息
 */
export interface RequestError {
  code: number /** 错误码 */;
  message: string /** 错误消息 */;
  status?: number /** HTTP 状态码 */;
  url?: string /** 请求地址 */;
  method?: string /** 请求方法 */;
}

/**
 * 上传文件响应
 */
export interface UploadResponse {
  url: string /** 文件访问地址 */;
  filename: string /** 文件名 */;
  size: number /** 文件大小 */;
  type: string /** 文件类型 */;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string /** 用户ID */;
  username: string /** 用户名 */;
  nickname?: string /** 昵称 */;
  email?: string /** 邮箱 */;
  phone?: string /** 手机号 */;
  avatar?: string /** 头像 */;
  status: number /** 状态：1-正常，0-禁用 */;
  roles?: string[] /** 角色列表 */;
  permissions?: string[] /** 权限列表 */;
  createTime?: string /** 创建时间 */;
  updateTime?: string /** 更新时间 */;
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string /** 用户名 */;
  password: string /** 密码 */;
  captcha?: string /** 验证码 */;
  captchaId?: string /** 验证码ID */;
  rememberMe?: boolean /** 记住我 */;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  token: string /** 访问令牌 */;
  refreshToken?: string /** 刷新令牌 */;
  userInfo: UserInfo /** 用户信息 */;
  expiresIn?: number /** 过期时间（秒） */;
}


