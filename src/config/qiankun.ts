import { registerMicroApps, start, initGlobalState } from 'qiankun';
import { microApps, devMicroApps } from './microApps';

/**
 * 全局状态管理
 */
export interface GlobalState {
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  theme?: 'light' | 'dark';
  token?: string;
}

// 初始化全局状态
const initialState: GlobalState = {
  user: undefined,
  theme: 'light',
  token: undefined,
};

// 初始化全局状态管理
const globalStateActions = initGlobalState(initialState);

// 保存当前状态的引用
let currentGlobalState: GlobalState = { ...initialState };

/**
 * qiankun 生命周期钩子
 */
const lifeCycles = {
  beforeLoad: async (app: any) => {
    console.log('[LifeCycle] before load %c%s', 'color: green;', app.name);
  },
  beforeMount: async (app: any) => {
    console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name);
  },
  afterUnmount: async (app: any) => {
    console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name);
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
    fetch: (url, ...args) => {
      // 自定义 fetch 方法，可以添加认证等逻辑
      return window.fetch(url, ...args);
    },
  });

  console.log('🚀 qiankun started');
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
  return globalStateActions.onGlobalStateChange((state: GlobalState, prev: GlobalState) => {
    // 更新本地状态引用
    currentGlobalState = { ...state };
    callback(state, prev);
  }, true);
}

