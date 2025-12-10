export * from './plugin-manager';
export * from './vue-plugin';
export * from './react-plugin';

import { PluginManager } from './plugin-manager';
import { VuePlugin } from './vue-plugin';
import { ReactPlugin } from './react-plugin';
import { PluginContext } from '../types';

/**
 * 创建默认插件管理器
 */
export function createDefaultPluginManager(context: PluginContext): PluginManager {
  const pluginManager = new PluginManager(context);
  
  // 注册内置插件
  pluginManager.register(VuePlugin);
  pluginManager.register(ReactPlugin);
  
  return pluginManager;
}
