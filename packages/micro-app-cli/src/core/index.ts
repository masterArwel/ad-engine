export * from './cli';

import { MicroFrontendCLI } from './cli';
import { CLIConfig } from '../types';

/**
 * 创建 CLI 实例
 */
export function createCLI(config?: Partial<CLIConfig>): MicroFrontendCLI {
  return new MicroFrontendCLI(config);
}

/**
 * 快速创建应用
 */
export async function createApp(config?: Partial<CLIConfig>): Promise<void> {
  const cli = createCLI(config);
  await cli.createApp();
}

/**
 * 获取 CLI 信息
 */
export function getCLIInfo(config?: Partial<CLIConfig>): { version: string; plugins: any[]; config: CLIConfig } {
  const cli = createCLI(config);
  return cli.getInfo();
}
