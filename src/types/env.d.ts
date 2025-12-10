/**
 * 环境变量类型定义
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string;
  
  /** 应用版本 */
  readonly VITE_APP_VERSION: string;
  
  /** 开发服务器端口 */
  readonly VITE_DEV_PORT: string;
  
  /** API 基础地址 */
  readonly VITE_API_BASE_URL: string;
  
  /** 文件上传地址 */
  readonly VITE_UPLOAD_URL: string;
  
  /** WebSocket 地址 */
  readonly VITE_WS_URL: string;
  
  /** Vue 微应用地址 */
  readonly VITE_VUE_APP_URL: string;
  
  /** React 微应用地址 */
  readonly VITE_REACT_APP_URL: string;
  
  /** 是否启用 Mock */
  readonly VITE_ENABLE_MOCK: string;
  
  /** 是否启用 HTTPS */
  readonly VITE_ENABLE_HTTPS: string;
  
  /** CDN 地址 */
  readonly VITE_CDN_URL: string;
  
  /** 公共路径 */
  readonly VITE_PUBLIC_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


