export * from './logger';
export * from './file-generator';
export * from './dependency-manager';
export * from './config-manager';

import validateNpmPackageName from 'validate-npm-package-name';
import * as semver from 'semver';

/**
 * 验证应用名称
 */
export function validateAppName(name: string): { valid: boolean; message?: string } {
  if (!name.trim()) {
    return { valid: false, message: '应用名称不能为空' };
  }

  const result = validateNpmPackageName(name);
  if (!result.validForNewPackages) {
    return { 
      valid: false, 
      message: result.errors?.[0] || result.warnings?.[0] || '应用名称格式不正确'
    };
  }

  return { valid: true };
}

/**
 * 验证端口号
 */
export function validatePort(port: string | number): { valid: boolean; message?: string } {
  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
  
  if (isNaN(portNum)) {
    return { valid: false, message: '端口号必须是数字' };
  }

  if (portNum < 1000 || portNum > 65535) {
    return { valid: false, message: '端口号必须在 1000-65535 之间' };
  }

  return { valid: true };
}

/**
 * 验证 Node.js 版本
 */
export function validateNodeVersion(requiredVersion = '>=16.0.0'): { valid: boolean; message?: string } {
  const currentVersion = process.version;
  
  if (!semver.satisfies(currentVersion, requiredVersion)) {
    return {
      valid: false,
      message: `需要 Node.js ${requiredVersion}，当前版本: ${currentVersion}`
    };
  }

  return { valid: true };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取随机端口
 */
export function getRandomPort(min = 3000, max = 9000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 驼峰命名转换
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 帕斯卡命名转换
 */
export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * 短横线命名转换
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * 检查是否为空对象
 */
export function isEmptyObject(obj: any): boolean {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * 获取当前时间戳
 */
export function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * 检查命令是否存在
 */
export async function commandExists(command: string): Promise<boolean> {
  const { spawn } = await import('cross-spawn');
  
  return new Promise((resolve) => {
    const child = spawn(command, ['--version'], { stdio: 'ignore' });
    
    child.on('close', (code) => {
      resolve(code === 0);
    });

    child.on('error', () => {
      resolve(false);
    });
  });
}
