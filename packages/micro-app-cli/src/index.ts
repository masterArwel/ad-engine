/**
 * 微前端 CLI 工具包
 * @author Your Name
 * @version 1.0.0
 */

// 核心功能
export * from './core';
export * from './types';
export * from './utils';
export * from './plugins';

// 主要导出
export { MicroFrontendCLI, createCLI, createApp, getCLIInfo } from './core';
export { 
  CLILogger, 
  CLIFileGenerator, 
  CLIDependencyManager, 
  CLIConfigManager 
} from './utils';
export { 
  PluginManager, 
  VuePlugin, 
  ReactPlugin, 
  createDefaultPluginManager 
} from './plugins';

// 类型导出
export type {
  MicroAppConfig,
  FrameworkPlugin,
  TemplateConfig,
  CLIConfig,
  CreateAppOptions,
  PluginContext,
  ValidationResult,
  Logger,
  FileGenerator,
  DependencyManager,
  ConfigManager
} from './types';
