import { registerMicroApps, start, initGlobalState } from 'qiankun';
import { microApps, devMicroApps } from './microApps';
import type { AuthState } from '../types/auth';

/**
 * 全局状态管理
 */
export interface GlobalState {
  /** 认证状态 */
  auth: AuthState;
  /** 主题设置 */
  theme?: 'light' | 'dark';
}

// 初始化全局状态
const initialState: GlobalState = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
  },
  theme: 'light',
};

// 初始化全局状态管理
const globalStateActions = initGlobalState(initialState);

// 保存当前状态的引用
let currentGlobalState: GlobalState = { ...initialState };

/**
 * qiankun 生命周期钩子
 */
const lifeCycles = {
  beforeLoad: async () => {
    // 微应用加载前的准备工作
  },
  beforeMount: async (app: { name: string }) => {
    // 常驻容器应该始终存在
    const container = document.getElementById('subapp-viewport');
    if (!container) {
      throw new Error(`常驻容器 #subapp-viewport 不存在！应用: ${app.name}`);
    }
    
    // 清空容器内容，为新的微应用做准备
    container.innerHTML = '';
    // 确保容器可见
    container.classList.add('loading');
  },
  afterUnmount: async () => {
    // 清理容器内容，但保持容器存在
    const container = document.getElementById('subapp-viewport');
    if (container) {
      container.innerHTML = '';
      container.classList.remove('loading', 'active');
    }
  },
};

/**
 * 初始化 qiankun
 */
export function initQiankun() {
  // 根据环境选择微应用配置
  const isDev = import.meta.env.DEV;
  const apps = isDev ? devMicroApps : microApps;
  
  // 注册微应用
  registerMicroApps(
    apps.map(app => ({
      ...app,
      props: {
        ...app.props,
        // 传递全局状态管理方法
        getGlobalState,
        setGlobalState,
        onGlobalStateChange,
      },
    })),
    lifeCycles
  );

  // 启动 qiankun
  start({
    sandbox: {
      strictStyleIsolation: false,
      experimentalStyleIsolation: true,
    },
    prefetch: 'all',
    singular: false, // 允许多个微应用同时存在
    fetch: (url, ...args) => {
      // 自定义 fetch 方法，可以添加认证等逻辑
      return window.fetch(url, ...args);
    },
    // 移除 getPublicPath 配置，使用默认行为
  });

  // qiankun 启动完成
}

/**
 * 设置全局状态
 */
export function setGlobalState(state: Partial<GlobalState>) {
  // 更新本地状态引用
  currentGlobalState = { ...currentGlobalState, ...state };
  globalStateActions.setGlobalState(state);
}

/**
 * 获取全局状态
 */
export function getGlobalState(): GlobalState {
  return currentGlobalState;
}

/**
 * 监听全局状态变化
 */
export function onGlobalStateChange(callback: (state: GlobalState, prev: GlobalState) => void) {
  return globalStateActions.onGlobalStateChange((state: any, prev: any) => {
    // 更新本地状态引用
    currentGlobalState = { ...state };
    callback(state as GlobalState, prev as GlobalState);
  }, true);
}

