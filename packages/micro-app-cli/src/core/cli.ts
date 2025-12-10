import * as path from 'path';
import * as inquirer from 'inquirer';
import * as ora from 'ora';
import { 
  MicroAppConfig, 
  CreateAppOptions, 
  CLIConfig, 
  QuestionConfig,
  PluginContext,
  ValidationResult
} from '../types';
import { 
  CLILogger, 
  CLIFileGenerator, 
  CLIDependencyManager, 
  CLIConfigManager,
  validateAppName,
  validatePort
} from '../utils';
import { PluginManager, createDefaultPluginManager } from '../plugins';

/**
 * 微前端 CLI 核心类
 */
export class MicroFrontendCLI {
  private logger: CLILogger;
  private fileGenerator: CLIFileGenerator;
  private dependencyManager: CLIDependencyManager;
  private configManager: CLIConfigManager;
  private pluginManager: PluginManager;
  private config: CLIConfig;

  constructor(config?: Partial<CLIConfig>) {
    this.logger = new CLILogger();
    this.fileGenerator = new CLIFileGenerator();
    this.dependencyManager = new CLIDependencyManager();
    this.configManager = new CLIConfigManager();
    
    // 加载配置
    this.config = this.configManager.merge(
      this.configManager.load(),
      config || {}
    );

    // 创建插件上下文
    const pluginContext: PluginContext = {
      cliConfig: this.config,
      utils: {
        log: (message: string, type = 'info') => {
          switch (type) {
            case 'warn': this.logger.warn(message); break;
            case 'error': this.logger.error(message); break;
            case 'success': this.logger.success(message); break;
            default: this.logger.info(message);
          }
        },
        exec: async (command: string, options?: any) => {
          // 执行命令的实现
          const { spawn } = await import('cross-spawn');
          return new Promise((resolve, reject) => {
            const child = spawn(command, [], { ...options, stdio: 'pipe' });
            let output = '';
            
            child.stdout?.on('data', (data) => {
              output += data.toString();
            });
            
            child.on('close', (code) => {
              if (code === 0) {
                resolve(output);
              } else {
                reject(new Error(`Command failed with code ${code}`));
              }
            });
            
            child.on('error', reject);
          });
        },
        fs: require('fs-extra'),
        path: path
      }
    };

    // 初始化插件管理器
    this.pluginManager = createDefaultPluginManager(pluginContext);
  }

  /**
   * 创建微前端应用
   */
  async createApp(options?: Partial<CreateAppOptions>): Promise<void> {
    try {
      this.logger.title('欢迎使用微前端子应用创建工具');

      // 获取用户配置
      const config = await this.promptForConfig();
      
      // 验证配置
      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        this.logger.error(validation.message || '配置验证失败');
        return;
      }

      // 创建应用
      await this.executeCreateApp({
        config,
        skipInstall: options?.skipInstall || false,
        verbose: options?.verbose || false,
        template: options?.template
      });

      // 显示完成信息
      this.logger.completion(config.name, config.framework, config.port);

    } catch (error) {
      this.logger.error(`创建失败: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * 交互式配置收集
   */
  private async promptForConfig(): Promise<MicroAppConfig> {
    const questions: QuestionConfig[] = [
      {
        type: 'input',
        name: 'name',
        message: '请输入应用名称:',
        validate: (input: string) => {
          const result = validateAppName(input);
          return result.valid || result.message || false;
        },
        filter: (input: string) => input.trim().toLowerCase()
      },
      {
        type: 'list',
        name: 'framework',
        message: '选择技术栈:',
        choices: [
          {
            name: '🟢 Vue 3 + TypeScript + Vite',
            value: 'vue',
            short: 'Vue'
          },
          {
            name: '🔵 React + TypeScript + Vite',
            value: 'react',
            short: 'React'
          }
        ]
      },
      {
        type: 'input',
        name: 'port',
        message: '请输入开发服务器端口:',
        default: () => this.getNextAvailablePort(),
        validate: (input: string) => {
          const result = validatePort(input);
          return result.valid || result.message || false;
        }
      },
      {
        type: 'confirm',
        name: 'useRouter',
        message: '是否使用路由?',
        default: true
      },
      {
        type: 'confirm',
        name: 'useStateManagement',
        message: '是否使用状态管理?',
        default: true
      },
      {
        type: 'list',
        name: 'cssPreprocessor',
        message: '选择 CSS 预处理器:',
        choices: [
          { name: 'CSS', value: 'css' },
          { name: 'Sass/SCSS', value: 'scss' },
          { name: 'Less', value: 'less' },
          { name: 'Stylus', value: 'stylus' }
        ],
        default: 'css'
      },
      {
        type: 'confirm',
        name: 'useEslint',
        message: '是否使用 ESLint?',
        default: true
      },
      {
        type: 'confirm',
        name: 'usePrettier',
        message: '是否使用 Prettier?',
        default: true
      },
      {
        type: 'confirm',
        name: 'addToMainApp',
        message: '是否自动注册到基座应用?',
        default: true
      }
    ];

    const answers = await (inquirer as any).prompt(questions);
    
    return {
      ...answers,
      port: parseInt(answers.port, 10),
      outputDir: this.config.defaultOutputDir
    } as MicroAppConfig;
  }

  /**
   * 验证配置
   */
  private async validateConfig(config: MicroAppConfig): Promise<ValidationResult> {
    // 检查应用名称是否已存在
    const appPath = path.join(process.cwd(), config.outputDir || this.config.defaultOutputDir, config.name);
    if (await this.fileGenerator.exists(appPath)) {
      return {
        valid: false,
        message: `应用 "${config.name}" 已存在`
      };
    }

    // 检查端口是否被占用
    // 这里可以添加端口检查逻辑

    // 验证框架配置
    if (!this.pluginManager.validateFrameworkConfig(config.framework, config)) {
      return {
        valid: false,
        message: `框架 "${config.framework}" 配置验证失败`
      };
    }

    return { valid: true };
  }

  /**
   * 执行应用创建
   */
  private async executeCreateApp(options: CreateAppOptions): Promise<void> {
    const { config, skipInstall, verbose } = options;
    
    this.logger.info(`开始创建 ${config.framework.toUpperCase()} 应用: ${config.name}`);

    // 确保输出目录存在
    const outputDir = path.join(process.cwd(), config.outputDir || this.config.defaultOutputDir);
    await this.fileGenerator.generateDir(outputDir);

    const appPath = path.join(outputDir, config.name);
    
    // 创建应用基础结构
    const spinner = (ora as any)('正在创建项目结构...').start();
    
    try {
      // 使用插件创建应用
      await this.pluginManager.createApp(config.framework, appPath, config);
      
      spinner.succeed('项目结构创建完成');
      
      // 安装依赖
      if (!skipInstall) {
        const installSpinner = (ora as any)('正在安装依赖...').start();
        try {
          await this.dependencyManager.install([], { cwd: appPath });
          installSpinner.succeed('依赖安装完成');
        } catch (error) {
          installSpinner.fail('依赖安装失败');
          throw error;
        }
      }
      
      // 注册到基座应用
      if (config.addToMainApp) {
        const registerSpinner = (ora as any)('正在注册到基座应用...').start();
        try {
          await this.registerToMainApp(config);
          registerSpinner.succeed('注册到基座应用完成');
        } catch (error) {
          registerSpinner.warn('注册到基座应用失败，请手动配置');
          this.logger.debug(`注册失败原因: ${error}`);
        }
      }
      
    } catch (error) {
      spinner.fail('创建失败');
      throw error;
    }
  }

  /**
   * 注册到基座应用
   */
  private async registerToMainApp(config: MicroAppConfig): Promise<void> {
    if (!this.config.mainAppConfig) {
      throw new Error('基座应用配置未找到');
    }

    const { mainAppConfig } = this.config;
    
    // 更新微应用配置
    await this.updateMicroAppsConfig(config, mainAppConfig.microAppsConfigPath);
    
    // 更新路由配置
    await this.updateRouterConfig(config, mainAppConfig.routerConfigPath);
    
    // 更新布局组件
    await this.updateLayoutComponent(config, mainAppConfig.layoutComponentPath);
  }

  /**
   * 更新微应用配置
   */
  private async updateMicroAppsConfig(config: MicroAppConfig, configPath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), configPath);
    
    if (!await this.fileGenerator.exists(fullPath)) {
      return;
    }

    let content = await this.fileGenerator.readFile(fullPath);
    
    const newApp = `  {
    name: '${config.name}',
    entry: 'http://localhost:${config.port}',
    container: '#subapp-viewport',
    activeRule: '/${config.name}',
    props: {
      routerBase: '/${config.name}',
    },
  },`;

    // 查找 devMicroApps 数组的结束位置
    const devMicroAppsMatch = content.match(/export const devMicroApps[^=]*=\s*\[([\s\S]*?)\];/);
    if (devMicroAppsMatch) {
      const arrayContent = devMicroAppsMatch[1];
      const newArrayContent = arrayContent.trim() ? `${arrayContent.trim()}\n${newApp}` : newApp;
      content = content.replace(devMicroAppsMatch[0], `export const devMicroApps: MicroApp[] = [\n${newArrayContent}\n];`);
    }

    await this.fileGenerator.generateFile(fullPath, content);
  }

  /**
   * 更新路由配置
   */
  private async updateRouterConfig(config: MicroAppConfig, routerPath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), routerPath);
    
    if (!await this.fileGenerator.exists(fullPath)) {
      return;
    }

    let content = await this.fileGenerator.readFile(fullPath);
    
    const newRoute = `      {
        path: '${config.name}/*',
        element: <MicroAppContainer />,
      },`;

    // 查找 children 数组
    const childrenMatch = content.match(/(children:\s*\[)([\s\S]*?)(\s*\])/);
    if (childrenMatch) {
      const existingRoutes = childrenMatch[2];
      const newRoutes = existingRoutes.trim() ? `${existingRoutes}\n${newRoute}` : `\n${newRoute}\n`;
      content = content.replace(childrenMatch[0], `${childrenMatch[1]}${newRoutes}${childrenMatch[3]}`);
    }

    await this.fileGenerator.generateFile(fullPath, content);
  }

  /**
   * 更新布局组件
   */
  private async updateLayoutComponent(config: MicroAppConfig, layoutPath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), layoutPath);
    
    if (!await this.fileGenerator.exists(fullPath)) {
      return;
    }

    let content = await this.fileGenerator.readFile(fullPath);
    
    const newNavLink = `          <Link 
            to="/${config.name}" 
            className={location.pathname.startsWith('/${config.name}') ? 'active' : ''}
          >
            ${config.name}
          </Link>`;

    // 查找导航区域
    const navMatch = content.match(/(<nav className="header-nav">[\s\S]*?)(\s*<\/nav>)/);
    if (navMatch) {
      const existingNav = navMatch[1];
      const newNav = `${existingNav}\n${newNavLink}`;
      content = content.replace(navMatch[0], `${newNav}${navMatch[2]}`);
    }

    await this.fileGenerator.generateFile(fullPath, content);
  }

  /**
   * 获取下一个可用端口
   */
  private async getNextAvailablePort(): Promise<number> {
    const outputDir = path.join(process.cwd(), this.config.defaultOutputDir);
    let defaultPort = this.config.defaultPortStart;
    
    if (await this.fileGenerator.exists(outputDir)) {
      const apps = await this.fileGenerator.readDir(outputDir);
      const appDirs = [];
      
      for (const app of apps) {
        const appPath = path.join(outputDir, app);
        const stat = require('fs').statSync(appPath);
        if (stat.isDirectory()) {
          appDirs.push(app);
        }
      }
      
      defaultPort = this.config.defaultPortStart + appDirs.length;
    }
    
    return defaultPort;
  }

  /**
   * 获取 CLI 信息
   */
  getInfo(): { version: string; plugins: any[]; config: CLIConfig } {
    const packageJson = require('../../package.json');
    
    return {
      version: packageJson.version,
      plugins: this.pluginManager.getPluginInfo(),
      config: this.config
    };
  }

  /**
   * 更新配置
   */
  async updateConfig(newConfig: Partial<CLIConfig>): Promise<void> {
    this.config = this.configManager.merge(this.config, newConfig);
    await this.configManager.save(this.config);
  }
}
