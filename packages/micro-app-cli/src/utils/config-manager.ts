import * as fs from 'fs-extra';
import * as path from 'path';
import { CLIConfig, ConfigManager } from '../types';

/**
 * 配置管理器
 */
export class CLIConfigManager implements ConfigManager {
  private defaultConfig: CLIConfig = {
    defaultOutputDir: 'sub-apps',
    defaultPortStart: 3001,
    supportedFrameworks: ['vue', 'react', 'angular'],
    mainAppConfig: {
      microAppsConfigPath: 'src/config/microApps.ts',
      routerConfigPath: 'src/router/index.tsx',
      layoutComponentPath: 'src/components/Layout.tsx'
    }
  };

  /**
   * 加载配置
   */
  load(configPath?: string): CLIConfig {
    const configFile = configPath || this.getDefaultConfigPath();
    
    if (fs.existsSync(configFile)) {
      try {
        const userConfig = fs.readJsonSync(configFile);
        return this.merge(this.defaultConfig, userConfig);
      } catch (error) {
        console.warn(`Failed to load config from ${configFile}, using default config`);
      }
    }
    
    return this.defaultConfig;
  }

  /**
   * 保存配置
   */
  async save(config: CLIConfig, configPath?: string): Promise<void> {
    const configFile = configPath || this.getDefaultConfigPath();
    await fs.ensureDir(path.dirname(configFile));
    await fs.writeJson(configFile, config, { spaces: 2 });
  }

  /**
   * 合并配置
   */
  merge(config1: CLIConfig, config2: Partial<CLIConfig>): CLIConfig {
    return {
      ...config1,
      ...config2,
      mainAppConfig: config2.mainAppConfig ? {
        ...config1.mainAppConfig,
        ...config2.mainAppConfig
      } : config1.mainAppConfig
    };
  }

  /**
   * 获取默认配置文件路径
   */
  private getDefaultConfigPath(): string {
    const homeDir = require('os').homedir();
    return path.join(homeDir, '.micro-cli', 'config.json');
  }

  /**
   * 获取项目配置文件路径
   */
  getProjectConfigPath(projectRoot?: string): string {
    const root = projectRoot || process.cwd();
    return path.join(root, '.micro-cli.json');
  }

  /**
   * 加载项目配置
   */
  loadProjectConfig(projectRoot?: string): Partial<CLIConfig> {
    const configPath = this.getProjectConfigPath(projectRoot);
    
    if (fs.existsSync(configPath)) {
      try {
        return fs.readJsonSync(configPath);
      } catch (error) {
        console.warn(`Failed to load project config from ${configPath}`);
      }
    }
    
    return {};
  }

  /**
   * 保存项目配置
   */
  async saveProjectConfig(config: Partial<CLIConfig>, projectRoot?: string): Promise<void> {
    const configPath = this.getProjectConfigPath(projectRoot);
    await fs.writeJson(configPath, config, { spaces: 2 });
  }

  /**
   * 验证配置
   */
  validate(config: CLIConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.defaultOutputDir) {
      errors.push('defaultOutputDir is required');
    }

    if (!config.defaultPortStart || config.defaultPortStart < 1000) {
      errors.push('defaultPortStart must be >= 1000');
    }

    if (!Array.isArray(config.supportedFrameworks) || config.supportedFrameworks.length === 0) {
      errors.push('supportedFrameworks must be a non-empty array');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 重置为默认配置
   */
  reset(): CLIConfig {
    return { ...this.defaultConfig };
  }

  /**
   * 获取框架特定配置
   */
  getFrameworkConfig(framework: string): any {
    const frameworkConfigs = {
      vue: {
        defaultDependencies: {
          'vue': '^3.4.0',
          'vue-router': '^4.2.5',
          'pinia': '^2.1.7',
          'vite-plugin-qiankun': '^1.0.15'
        },
        defaultDevDependencies: {
          '@vitejs/plugin-vue': '^5.0.0',
          'typescript': '^5.3.0',
          'vue-tsc': '^1.8.25',
          'vite': '^5.0.0'
        }
      },
      react: {
        defaultDependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'react-router-dom': '^6.20.0',
          'zustand': '^4.4.7',
          'vite-plugin-qiankun': '^1.0.15'
        },
        defaultDevDependencies: {
          '@types/react': '^18.2.43',
          '@types/react-dom': '^18.2.17',
          '@vitejs/plugin-react': '^4.2.1',
          'typescript': '^5.2.2',
          'vite': '^5.0.8'
        }
      },
      angular: {
        defaultDependencies: {
          '@angular/core': '^17.0.0',
          '@angular/common': '^17.0.0',
          '@angular/router': '^17.0.0',
          'single-spa-angular': '^8.0.0'
        },
        defaultDevDependencies: {
          '@angular/cli': '^17.0.0',
          '@angular/compiler-cli': '^17.0.0',
          'typescript': '^5.2.0'
        }
      }
    };

    return frameworkConfigs[framework as keyof typeof frameworkConfigs] || {};
  }
}
