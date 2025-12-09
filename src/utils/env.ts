/**
 * 环境变量工具
 */

/**
 * 获取环境变量
 */
export const getEnv = (key: string, defaultValue?: string): string => {
  return import.meta.env[key] || defaultValue || '';
};

/**
 * 判断是否为开发环境
 */
export const isDev = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * 判断是否为生产环境
 */
export const isProd = (): boolean => {
  return import.meta.env.PROD;
};

/**
 * 获取应用配置
 */
export const getAppConfig = () => {
  return {
    title: getEnv('VITE_APP_TITLE', '微前端基座应用'),
    version: getEnv('VITE_APP_VERSION', '1.0.0'),
    port: getEnv('VITE_DEV_PORT', '3000'),
    vueAppUrl: getEnv('VITE_VUE_APP_URL', 'http://localhost:3001'),
    reactAppUrl: getEnv('VITE_REACT_APP_URL', 'http://localhost:3002'),
  };
};

