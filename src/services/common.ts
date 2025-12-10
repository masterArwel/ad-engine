/**
 * 通用 API 服务
 */

import { request, upload, download } from '../utils/request';
import type { ApiResponse, UploadResponse } from '../types/api';

/**
 * 字典数据项
 */
export interface DictItem {
  label: string /** 显示名称 */;
  value: string | number /** 值 */;
  disabled?: boolean /** 是否禁用 */;
  children?: DictItem[] /** 子项 */;
}

/**
 * 系统配置项
 */
export interface SystemConfig {
  key: string /** 配置键 */;
  value: string /** 配置值 */;
  description?: string /** 描述 */;
  type: 'string' | 'number' | 'boolean' | 'json' /** 类型 */;
}

/**
 * 通用 API 服务
 */
export const commonApi = {
  /**
   * 文件上传
   * @param file 文件
   * @param onProgress 上传进度回调
   */
  uploadFile(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<UploadResponse>> {
    return upload<UploadResponse>('/common/upload', file, onProgress);
  },

  /**
   * 批量文件上传
   * @param files 文件列表
   * @param onProgress 上传进度回调
   */
  uploadFiles(files: File[], onProgress?: (progress: number) => void): Promise<ApiResponse<UploadResponse[]>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    return request<UploadResponse[]>({
      url: '/common/upload/batch',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 图片上传（带压缩）
   * @param file 图片文件
   * @param quality 压缩质量 0-1
   * @param maxWidth 最大宽度
   * @param maxHeight 最大高度
   */
  uploadImage(
    file: File, 
    options?: {
      quality?: number;
      maxWidth?: number;
      maxHeight?: number;
    }
  ): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return request<UploadResponse>({
      url: '/common/upload/image',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 文件下载
   * @param fileId 文件ID
   * @param filename 文件名
   */
  downloadFile(fileId: string, filename?: string): Promise<void> {
    return download(`/common/download/${fileId}`, filename);
  },

  /**
   * 删除文件
   * @param fileId 文件ID
   */
  deleteFile(fileId: string): Promise<ApiResponse<void>> {
    return request<void>({
      url: `/common/files/${fileId}`,
      method: 'DELETE',
    });
  },

  /**
   * 获取字典数据
   * @param dictType 字典类型
   */
  getDictData(dictType: string): Promise<ApiResponse<DictItem[]>> {
    return request<DictItem[]>({
      url: '/common/dict',
      method: 'GET',
      params: { type: dictType },
    });
  },

  /**
   * 获取多个字典数据
   * @param dictTypes 字典类型列表
   */
  getMultipleDictData(dictTypes: string[]): Promise<ApiResponse<Record<string, DictItem[]>>> {
    return request<Record<string, DictItem[]>>({
      url: '/common/dict/multiple',
      method: 'GET',
      params: { types: dictTypes.join(',') },
    });
  },

  /**
   * 获取省市区数据
   * @param parentCode 父级编码，不传则获取省份
   */
  getRegionData(parentCode?: string): Promise<ApiResponse<DictItem[]>> {
    return request<DictItem[]>({
      url: '/common/region',
      method: 'GET',
      params: { parentCode },
    });
  },

  /**
   * 获取完整的省市区树形数据
   */
  getRegionTree(): Promise<ApiResponse<DictItem[]>> {
    return request<DictItem[]>({
      url: '/common/region/tree',
      method: 'GET',
    });
  },

  /**
   * 获取系统配置
   * @param keys 配置键列表
   */
  getSystemConfig(keys?: string[]): Promise<ApiResponse<SystemConfig[]>> {
    return request<SystemConfig[]>({
      url: '/common/config',
      method: 'GET',
      params: keys ? { keys: keys.join(',') } : undefined,
    });
  },

  /**
   * 更新系统配置
   * @param configs 配置列表
   */
  updateSystemConfig(configs: Partial<SystemConfig>[]): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/common/config',
      method: 'PUT',
      data: { configs },
    });
  },

  /**
   * 发送邮件
   * @param to 收件人
   * @param subject 主题
   * @param content 内容
   * @param attachments 附件ID列表
   */
  sendEmail(
    to: string | string[], 
    subject: string, 
    content: string, 
    attachments?: string[]
  ): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/common/email/send',
      method: 'POST',
      data: {
        to: Array.isArray(to) ? to : [to],
        subject,
        content,
        attachments,
      },
    });
  },

  /**
   * 发送短信
   * @param phone 手机号
   * @param template 模板编码
   * @param params 模板参数
   */
  sendSms(phone: string, template: string, params?: Record<string, any>): Promise<ApiResponse<void>> {
    return request<void>({
      url: '/common/sms/send',
      method: 'POST',
      data: { phone, template, params },
    });
  },

  /**
   * 获取二维码
   * @param content 二维码内容
   * @param size 尺寸
   */
  generateQrCode(content: string, size?: number): Promise<ApiResponse<{ qrCode: string }>> {
    return request<{ qrCode: string }>({
      url: '/common/qrcode',
      method: 'POST',
      data: { content, size: size || 200 },
    });
  },

  /**
   * 获取服务器时间
   */
  getServerTime(): Promise<ApiResponse<{ timestamp: number; datetime: string }>> {
    return request<{ timestamp: number; datetime: string }>({
      url: '/common/time',
      method: 'GET',
    });
  },

  /**
   * 健康检查
   */
  healthCheck(): Promise<ApiResponse<{ status: string; version: string; uptime: number }>> {
    return request<{ status: string; version: string; uptime: number }>({
      url: '/common/health',
      method: 'GET',
    });
  },

  /**
   * 获取系统信息
   */
  getSystemInfo(): Promise<ApiResponse<{
    version: string;
    buildTime: string;
    environment: string;
    features: string[];
  }>> {
    return request<{
      version: string;
      buildTime: string;
      environment: string;
      features: string[];
    }>({
      url: '/common/system-info',
      method: 'GET',
    });
  },
};


