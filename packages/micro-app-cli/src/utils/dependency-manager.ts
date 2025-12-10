import { spawn } from 'cross-spawn';
import * as path from 'path';
import * as fs from 'fs-extra';
import { DependencyManager } from '../types';

/**
 * 依赖管理器
 */
export class CLIDependencyManager implements DependencyManager {
  /**
   * 安装依赖包
   */
  async install(packages: string[], options: { dev?: boolean; cwd?: string } = {}): Promise<void> {
    const { dev = false, cwd = process.cwd() } = options;
    
    const args = ['install'];
    
    if (dev) {
      args.push('--save-dev');
    }
    
    args.push(...packages);

    return new Promise((resolve, reject) => {
      const child = spawn('npm', args, {
        cwd,
        stdio: 'inherit'
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`npm install failed with code ${code}`));
        } else {
          resolve();
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * 检查包是否存在
   */
  exists(packageName: string): boolean {
    try {
      require.resolve(packageName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取包版本
   */
  getVersion(packageName: string): string | null {
    try {
      const packagePath = require.resolve(`${packageName}/package.json`);
      const packageJson = require(packagePath);
      return packageJson.version;
    } catch {
      return null;
    }
  }

  /**
   * 检查 npm 是否可用
   */
  async checkNpm(): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn('npm', ['--version'], { stdio: 'ignore' });
      
      child.on('close', (code) => {
        resolve(code === 0);
      });

      child.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * 获取 npm 版本
   */
  async getNpmVersion(): Promise<string | null> {
    return new Promise((resolve) => {
      const child = spawn('npm', ['--version'], { stdio: 'pipe' });
      
      let output = '';
      
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          resolve(null);
        }
      });

      child.on('error', () => {
        resolve(null);
      });
    });
  }

  /**
   * 初始化 package.json
   */
  async initPackageJson(projectPath: string, config: any): Promise<void> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    await fs.writeJson(packageJsonPath, config, { spaces: 2 });
  }

  /**
   * 更新 package.json
   */
  async updatePackageJson(
    projectPath: string, 
    updates: { 
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
      [key: string]: any;
    }
  ): Promise<void> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      // 合并更新
      Object.entries(updates).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          packageJson[key] = { ...packageJson[key], ...value };
        } else {
          packageJson[key] = value;
        }
      });
      
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  }

  /**
   * 检查端口是否被占用
   */
  async isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn('lsof', ['-i', `:${port}`], { stdio: 'ignore' });
      
      child.on('close', (code) => {
        resolve(code === 0);
      });

      child.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * 获取可用端口
   */
  async getAvailablePort(startPort: number): Promise<number> {
    let port = startPort;
    
    while (await this.isPortInUse(port)) {
      port++;
    }
    
    return port;
  }
}
