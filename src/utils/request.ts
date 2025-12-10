/**
 * HTTP 请求工具封装
 * 基于 axios 实现，提供统一的请求/响应处理
 */

import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { ApiResponse, RequestConfig, RequestError } from '../types/api';
import { getGlobalState, setGlobalState } from '../config/qiankun';

/**
 * 请求超时时间
 */
const REQUEST_TIMEOUT = 10000;

/**
 * API 基础地址
 */
const getBaseURL = (): string => {
  const env = import.meta.env.MODE;
  
  switch (env) {
    case 'development':
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    case 'production':
      return import.meta.env.VITE_API_BASE_URL || '/api';
    default:
      return import.meta.env.VITE_API_BASE_URL || '/api';
  }
};

/**
 * 创建 axios 实例
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: REQUEST_TIMEOUT,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 添加认证 token
      const globalState = getGlobalState();
      if (globalState.token) {
        config.headers = config.headers || {};
        config.headers.token = globalState.token;
      }

      // 添加请求 ID（用于追踪）
      config.headers = config.headers || {};
      config.headers['X-Request-ID'] = generateRequestId();

      return config;
    },
    (error: AxiosError) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { data } = response;

      // 检查业务状态码
      if (data.code === 0 || data.success) {
        return response;
      }

      // 处理业务错误
      const error: RequestError = {
        code: data.code,
        message: data.message || '请求失败',
        status: response.status,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
      };

      // 特殊错误码处理
      handleBusinessError(error);

      return Promise.reject(error);
    },
    (error: AxiosError<ApiResponse>) => {
      const requestError: RequestError = {
        code: error.response?.data?.code || -1,
        message: error.response?.data?.message || error.message || '网络错误',
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      };

      return Promise.reject(requestError);
    }
  );

  return instance;
};

/**
 * 处理业务错误
 */
const handleBusinessError = (error: RequestError): void => {
  switch (error.code) {
    case 401:
      // 未授权，清除用户信息并跳转登录
      setGlobalState({ user: undefined, token: undefined });
      // 这里可以添加跳转到登录页的逻辑
      break;
    case 403:
      console.warn('权限不足');
      break;
    case 404:
      console.warn('请求的资源不存在');
      break;
    case 500:
      console.error('服务器内部错误');
      break;
    default:
      console.warn('业务错误:', error.message);
  }
};

/**
 * 生成请求 ID
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * axios 实例
 */
const axiosInstance = createAxiosInstance();

/**
 * 通用请求方法
 */
export const request = async <T = any>(config: RequestConfig): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.request<ApiResponse<T>>({
      url: config.url,
      method: config.method || 'GET',
      params: config.params,
      data: config.data,
      headers: config.headers,
      timeout: config.timeout,
      withCredentials: config.withCredentials,
    });

    return response.data;
  } catch (error) {
    // 重新抛出错误，让调用方处理
    console.error('请求失败:', error);
    throw error;
  }
};

/**
 * GET 请求
 */
export const get = <T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> => {
  return request<T>({ url, method: 'GET', params });
};

/**
 * POST 请求
 */
export const post = <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return request<T>({ url, method: 'POST', data });
};

/**
 * 文件上传
 */
export const upload = <T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post<ApiResponse<T>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  }).then(response => response.data);
};

/**
 * 文件下载
 */
export const download = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await axiosInstance.get(url, {
      responseType: 'blob',
    });

    // 创建下载链接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || getFilenameFromResponse(response) || 'download';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理资源
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('文件下载失败:', error);
    throw error;
  }
};

/**
 * 从响应头中获取文件名
 */
const getFilenameFromResponse = (response: AxiosResponse): string | null => {
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1].replace(/['"]/g, '');
    }
  }
  return null;
};

/**
 * 取消请求的 token
 */
export const CancelToken = axios.CancelToken;

/**
 * 判断是否为取消请求的错误
 */
export const isCancel = axios.isCancel;

// 导出 axios 实例供高级用法
export { axiosInstance };

// 默认导出
export default {
  request,
  get,
  post,
  upload,
  download,
  CancelToken,
  isCancel,
};


