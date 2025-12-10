/**
 * 微前端 CLI 工具类型定义
 */

export interface MicroAppConfig {
  /** 应用名称 */
  name: string;
  /** 技术栈 */
  framework: 'vue' | 'react' | 'angular';
  /** 开发服务器端口 */
  port: number;
  /** 是否使用路由 */
  useRouter: boolean;
  /** 是否使用状态管理 */
  useStateManagement: boolean;
  /** CSS 预处理器 */
  cssPreprocessor: 'css' | 'scss' | 'less' | 'stylus';
  /** 是否使用 ESLint */
  useEslint: boolean;
  /** 是否使用 Prettier */
  usePrettier: boolean;
  /** 是否自动注册到基座应用 */
  addToMainApp: boolean;
  /** 输出目录 */
  outputDir?: string;
  /** 自定义配置 */
  customConfig?: Record<string, any>;
}

export interface FrameworkPlugin {
  /** 插件名称 */
  name: string;
  /** 支持的框架 */
  framework: string;
  /** 创建应用函数 */
  createApp: (appPath: string, config: MicroAppConfig) => Promise<void>;
  /** 获取默认配置 */
  getDefaultConfig?: () => Partial<MicroAppConfig>;
  /** 验证配置 */
  validateConfig?: (config: MicroAppConfig) => boolean;
}

export interface TemplateConfig {
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 支持的框架 */
  frameworks: string[];
  /** 模板文件 */
  files: TemplateFile[];
  /** 依赖包 */
  dependencies?: Record<string, string>;
  /** 开发依赖包 */
  devDependencies?: Record<string, string>;
}

export interface TemplateFile {
  /** 文件路径 */
  path: string;
  /** 文件内容 */
  content: string | ((config: MicroAppConfig) => string);
  /** 是否为模板文件 */
  isTemplate?: boolean;
}

export interface CLIConfig {
  /** 默认输出目录 */
  defaultOutputDir: string;
  /** 默认端口起始值 */
  defaultPortStart: number;
  /** 支持的框架 */
  supportedFrameworks: string[];
  /** 插件目录 */
  pluginsDir?: string;
  /** 模板目录 */
  templatesDir?: string;
  /** 基座应用配置 */
  mainAppConfig?: MainAppConfig;
}

export interface MainAppConfig {
  /** 微应用配置文件路径 */
  microAppsConfigPath: string;
  /** 路由配置文件路径 */
  routerConfigPath: string;
  /** 布局组件文件路径 */
  layoutComponentPath: string;
  /** 配置更新函数 */
  updateConfig?: (config: MicroAppConfig) => Promise<void>;
}

export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  message?: string;
}

export interface CreateAppOptions {
  /** 应用配置 */
  config: MicroAppConfig;
  /** 是否跳过依赖安装 */
  skipInstall?: boolean;
  /** 是否使用详细输出 */
  verbose?: boolean;
  /** 自定义模板 */
  template?: string;
}

export interface PluginContext {
  /** CLI 配置 */
  cliConfig: CLIConfig;
  /** 工具函数 */
  utils: {
    /** 日志输出 */
    log: (message: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
    /** 执行命令 */
    exec: (command: string, options?: any) => Promise<string>;
    /** 文件操作 */
    fs: typeof import('fs-extra');
    /** 路径操作 */
    path: typeof import('path');
  };
}

export interface QuestionConfig {
  /** 问题类型 */
  type: 'input' | 'list' | 'confirm' | 'checkbox';
  /** 问题名称 */
  name: string;
  /** 问题描述 */
  message: string;
  /** 默认值 */
  default?: any;
  /** 选择项（用于 list 和 checkbox） */
  choices?: Array<{
    name: string;
    value: any;
    short?: string;
  }>;
  /** 验证函数 */
  validate?: (input: any) => boolean | string;
  /** 过滤函数 */
  filter?: (input: any) => any;
  /** 条件显示 */
  when?: (answers: any) => boolean;
}

export interface ProgressCallback {
  /** 开始进度 */
  start: (message: string) => void;
  /** 更新进度 */
  update: (message: string) => void;
  /** 成功完成 */
  succeed: (message: string) => void;
  /** 失败 */
  fail: (message: string) => void;
}

export interface Logger {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  success: (message: string) => void;
  debug: (message: string) => void;
}

export interface FileGenerator {
  /** 生成文件 */
  generateFile: (filePath: string, content: string) => Promise<void>;
  /** 生成目录 */
  generateDir: (dirPath: string) => Promise<void>;
  /** 复制文件 */
  copyFile: (src: string, dest: string) => Promise<void>;
  /** 复制目录 */
  copyDir: (src: string, dest: string) => Promise<void>;
}

export interface DependencyManager {
  /** 安装依赖 */
  install: (packages: string[], options?: { dev?: boolean; cwd?: string }) => Promise<void>;
  /** 检查包是否存在 */
  exists: (packageName: string) => boolean;
  /** 获取包版本 */
  getVersion: (packageName: string) => string | null;
}

export interface ConfigManager {
  /** 加载配置 */
  load: (configPath?: string) => CLIConfig;
  /** 保存配置 */
  save: (config: CLIConfig, configPath?: string) => Promise<void>;
  /** 合并配置 */
  merge: (config1: CLIConfig, config2: Partial<CLIConfig>) => CLIConfig;
}
