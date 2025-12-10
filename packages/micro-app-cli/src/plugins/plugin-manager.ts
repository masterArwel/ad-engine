import * as path from 'path';
import * as fs from 'fs-extra';
import { FrameworkPlugin, PluginContext, MicroAppConfig } from '../types';
import { CLILogger } from '../utils/logger';

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins: Map<string, FrameworkPlugin> = new Map();
  private logger: CLILogger;
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
    this.logger = new CLILogger();
  }

  /**
   * 注册插件
   */
  register(plugin: FrameworkPlugin): void {
    if (this.plugins.has(plugin.name)) {
      this.logger.warn(`Plugin ${plugin.name} is already registered`);
      return;
    }

    this.plugins.set(plugin.name, plugin);
    this.logger.debug(`Plugin ${plugin.name} registered for framework ${plugin.framework}`);
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): FrameworkPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 根据框架获取插件
   */
  getPluginByFramework(framework: string): FrameworkPlugin | undefined {
    for (const plugin of this.plugins.values()) {
      if (plugin.framework === framework) {
        return plugin;
      }
    }
    return undefined;
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): FrameworkPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取支持的框架列表
   */
  getSupportedFrameworks(): string[] {
    const frameworks = new Set<string>();
    for (const plugin of this.plugins.values()) {
      frameworks.add(plugin.framework);
    }
    return Array.from(frameworks);
  }

  /**
   * 卸载插件
   */
  unregister(name: string): boolean {
    const result = this.plugins.delete(name);
    if (result) {
      this.logger.debug(`Plugin ${name} unregistered`);
    }
    return result;
  }

  /**
   * 从目录加载插件
   */
  async loadPluginsFromDirectory(pluginDir: string): Promise<void> {
    if (!await fs.pathExists(pluginDir)) {
      this.logger.debug(`Plugin directory ${pluginDir} does not exist`);
      return;
    }

    const files = await fs.readdir(pluginDir);
    
    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        try {
          const pluginPath = path.join(pluginDir, file);
          const pluginModule = require(pluginPath);
          
          // 支持默认导出和命名导出
          const plugin = pluginModule.default || pluginModule;
          
          if (this.isValidPlugin(plugin)) {
            this.register(plugin);
          } else {
            this.logger.warn(`Invalid plugin format in ${file}`);
          }
        } catch (error) {
          this.logger.error(`Failed to load plugin from ${file}: ${error}`);
        }
      }
    }
  }

  /**
   * 验证插件格式
   */
  private isValidPlugin(plugin: any): plugin is FrameworkPlugin {
    return (
      plugin &&
      typeof plugin.name === 'string' &&
      typeof plugin.framework === 'string' &&
      typeof plugin.createApp === 'function'
    );
  }

  /**
   * 创建应用
   */
  async createApp(framework: string, appPath: string, config: MicroAppConfig): Promise<void> {
    const plugin = this.getPluginByFramework(framework);
    
    if (!plugin) {
      throw new Error(`No plugin found for framework: ${framework}`);
    }

    // 验证配置
    if (plugin.validateConfig && !plugin.validateConfig(config)) {
      throw new Error(`Invalid configuration for framework: ${framework}`);
    }

    // 创建应用
    await plugin.createApp(appPath, config);
  }

  /**
   * 获取框架默认配置
   */
  getFrameworkDefaultConfig(framework: string): Partial<MicroAppConfig> {
    const plugin = this.getPluginByFramework(framework);
    
    if (plugin && plugin.getDefaultConfig) {
      return plugin.getDefaultConfig();
    }

    return {};
  }

  /**
   * 验证框架配置
   */
  validateFrameworkConfig(framework: string, config: MicroAppConfig): boolean {
    const plugin = this.getPluginByFramework(framework);
    
    if (plugin && plugin.validateConfig) {
      return plugin.validateConfig(config);
    }

    return true;
  }

  /**
   * 获取插件信息
   */
  getPluginInfo(): Array<{ name: string; framework: string; hasDefaultConfig: boolean; hasValidation: boolean }> {
    return Array.from(this.plugins.values()).map(plugin => ({
      name: plugin.name,
      framework: plugin.framework,
      hasDefaultConfig: !!plugin.getDefaultConfig,
      hasValidation: !!plugin.validateConfig
    }));
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins.clear();
    this.logger.debug('All plugins cleared');
  }
}
