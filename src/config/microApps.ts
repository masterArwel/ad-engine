/**
 * 微应用配置
 */
export interface MicroApp {
  name: string;
  entry: string;
  container: string;
  activeRule: string;
  props?: Record<string, unknown>;
}

/**
 * 微应用列表配置
 */
export const microApps: MicroApp[] = [
  {
    name: 'adcommercial',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/ad-commercial',
    props: {
      routerBase: '/ad-commercial',
    },
  },
  {
    name: 'vue-app',
    entry: '//localhost:3002',
    container: '#subapp-viewport',
    activeRule: '/vue-app',
    props: {
      routerBase: '/vue-app',
    },
  },
  {
    name: 'react-app',
    entry: '//localhost:3003',
    container: '#subapp-viewport',
    activeRule: '/react-app',
    props: {
      routerBase: '/react-app',
    },
  },
];

/**
 * 开发环境微应用配置
 */
export const devMicroApps: MicroApp[] = [
  {
    name: 'adcommercial',
    entry: 'http://localhost:3002',
    container: '#subapp-viewport',
    activeRule: '/ad-commercial',
    props: {
      routerBase: '/ad-commercial',
    },
  },
  {
    name: 'vue-app',
    entry: 'http://localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/vue-app',
    props: {
      routerBase: '/vue-app',
    },
  },
  {
    name: 'react-app',
    entry: 'http://localhost:3003',
    container: '#subapp-viewport',
    activeRule: '/react-app',
    props: {
      routerBase: '/react-app',
    },
  },
];
