/**
 * 认证相关 Mock 数据
 */

import type { 
  UserInfo, 
  AuthResponse, 
  ApiResponse, 
  SendCodeResponse,
  UploadAvatarResponse 
} from '../types/auth';

/** Mock 用户数据 */
const mockUsers: UserInfo[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: '管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    email: 'user@example.com',
    name: '普通用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

/** Mock 密码数据（实际项目中不应该这样存储） */
const mockPasswords: Record<string, string> = {
  'admin@example.com': '123456',
  'user@example.com': '123456',
};

/** Mock 验证码数据 */
const mockVerificationCodes: Record<string, string> = {};

/** 生成 Mock Token */
const generateMockToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    userId, 
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30天过期
  }));
  const signature = btoa(`mock-signature-${userId}`);
  return `${header}.${payload}.${signature}`;
};

/** 从 Token 中解析用户ID */
const parseTokenUserId = (token: string): string | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
};

/** 生成随机验证码 */
const generateVerificationCode = (): string => {
  return Math.random().toString().slice(2, 8);
};

/** Mock 认证 API */
export const mockAuthAPI = {
  /** 登录 */
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === email);
    const storedPassword = mockPasswords[email];
    
    if (!user || storedPassword !== password) {
      return {
        code: 401,
        message: '邮箱或密码错误',
        data: null,
        success: false,
      };
    }
    
    const token = generateMockToken(user.id);
    
    return {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user,
        expiresIn: 30 * 24 * 60 * 60, // 30天
      },
      success: true,
    };
  },

  /** 注册 */
  register: async (email: string, password: string, name: string): Promise<ApiResponse<AuthResponse>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 检查邮箱是否已存在
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return {
        code: 400,
        message: '该邮箱已被注册',
        data: null,
        success: false,
      };
    }
    
    // 创建新用户
    const newUser: UserInfo = {
      id: String(mockUsers.length + 1),
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    mockPasswords[email] = password;
    
    const token = generateMockToken(newUser.id);
    
    return {
      code: 200,
      message: '注册成功',
      data: {
        token,
        user: newUser,
        expiresIn: 30 * 24 * 60 * 60,
      },
      success: true,
    };
  },

  /** 发送重置密码验证码 */
  sendResetCode: async (email: string): Promise<ApiResponse<SendCodeResponse>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return {
        code: 404,
        message: '该邮箱未注册',
        data: null,
        success: false,
      };
    }
    
    const code = generateVerificationCode();
    mockVerificationCodes[email] = code;
    
    // 模拟验证码5分钟后过期
    setTimeout(() => {
      delete mockVerificationCodes[email];
    }, 5 * 60 * 1000);
    
    console.log(`[Mock] 验证码已发送到 ${email}: ${code}`);
    
    return {
      code: 200,
      message: '验证码已发送到您的邮箱',
      data: {
        message: '验证码已发送，请查收邮件',
        expiresIn: 300, // 5分钟
      },
      success: true,
    };
  },

  /** 重置密码 */
  resetPassword: async (email: string, code: string, newPassword: string): Promise<ApiResponse<null>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedCode = mockVerificationCodes[email];
    if (!storedCode || storedCode !== code) {
      return {
        code: 400,
        message: '验证码错误或已过期',
        data: null,
        success: false,
      };
    }
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return {
        code: 404,
        message: '用户不存在',
        data: null,
        success: false,
      };
    }
    
    // 更新密码
    mockPasswords[email] = newPassword;
    delete mockVerificationCodes[email];
    
    return {
      code: 200,
      message: '密码重置成功',
      data: null,
      success: true,
    };
  },

  /** 获取用户信息 */
  getUserInfo: async (token: string): Promise<ApiResponse<UserInfo>> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const userId = parseTokenUserId(token);
    if (!userId) {
      return {
        code: 401,
        message: 'Token无效',
        data: null,
        success: false,
      };
    }
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return {
        code: 404,
        message: '用户不存在',
        data: null,
        success: false,
      };
    }
    
    return {
      code: 200,
      message: '获取成功',
      data: user,
      success: true,
    };
  },

  /** 更新用户信息 */
  updateUserInfo: async (token: string, userData: { name?: string; avatar?: string }): Promise<ApiResponse<UserInfo>> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const userId = parseTokenUserId(token);
    if (!userId) {
      return {
        code: 401,
        message: 'Token无效',
        data: null,
        success: false,
      };
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return {
        code: 404,
        message: '用户不存在',
        data: null,
        success: false,
      };
    }
    
    // 更新用户信息
    const updatedUser = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers[userIndex] = updatedUser;
    
    return {
      code: 200,
      message: '更新成功',
      data: updatedUser,
      success: true,
    };
  },

  /** 修改密码 */
  changePassword: async (token: string, oldPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userId = parseTokenUserId(token);
    if (!userId) {
      return {
        code: 401,
        message: 'Token无效',
        data: null,
        success: false,
      };
    }
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return {
        code: 404,
        message: '用户不存在',
        data: null,
        success: false,
      };
    }
    
    const currentPassword = mockPasswords[user.email];
    if (currentPassword !== oldPassword) {
      return {
        code: 400,
        message: '原密码错误',
        data: null,
        success: false,
      };
    }
    
    // 更新密码
    mockPasswords[user.email] = newPassword;
    
    return {
      code: 200,
      message: '密码修改成功',
      data: null,
      success: true,
    };
  },

  /** 上传头像 */
  uploadAvatar: async (file: File): Promise<ApiResponse<UploadAvatarResponse>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟文件上传，生成随机头像URL
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    
    return {
      code: 200,
      message: '头像上传成功',
      data: {
        avatarUrl,
      },
      success: true,
    };
  },

  /** 退出登录 */
  logout: async (): Promise<ApiResponse<null>> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      code: 200,
      message: '退出成功',
      data: null,
      success: true,
    };
  },
};

/** 导出 Mock 用户数据（用于测试） */
export const getMockUsers = () => [...mockUsers];

/** 导出 Mock 密码数据（仅用于开发调试） */
export const getMockPasswords = () => ({ ...mockPasswords });
