/**
 * Mock 数据入口文件
 */

export * from './auth';

/** Mock 数据配置 */
export const mockConfig = {
  /** 是否启用 Mock */
  enabled: true,
  /** 基础延迟时间（毫秒） */
  baseDelay: 200,
  /** 是否显示 Mock 日志 */
  showLogs: true,
};

/** Mock 响应工具函数 */
export const createMockResponse = <T>(
  data: T,
  message: string = '操作成功',
  code: number = 200
) => {
  return {
    code,
    message,
    data,
    success: code === 200,
  };
};

/** Mock 错误响应工具函数 */
export const createMockError = (
  message: string,
  code: number = 400
) => {
  return {
    code,
    message,
    data: null,
    success: false,
  };
};

/** 模拟网络延迟 */
export const mockDelay = (ms: number = mockConfig.baseDelay): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/** Mock 日志工具 */
export const mockLog = (action: string, data?: any) => {
  if (mockConfig.showLogs) {
    console.log(`[Mock API] ${action}`, data);
  }
};
