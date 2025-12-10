import chalk from 'chalk';
import { Logger } from '../types';

/**
 * 日志工具类
 */
export class CLILogger implements Logger {
  private verbose: boolean;

  constructor(verbose = false) {
    this.verbose = verbose;
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.log(chalk.red('✖'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), message);
    }
  }

  /**
   * 输出标题
   */
  title(message: string): void {
    console.log(chalk.blue.bold(`\n🚀 ${message}\n`));
  }

  /**
   * 输出分隔线
   */
  divider(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }

  /**
   * 输出完成信息
   */
  completion(appName: string, framework: string, port: number): void {
    console.log(chalk.green.bold('\n🎉 应用创建成功！\n'));
    
    console.log(chalk.blue('📋 应用信息:'));
    console.log(`   名称: ${chalk.cyan(appName)}`);
    console.log(`   框架: ${chalk.cyan(framework.toUpperCase())}`);
    console.log(`   端口: ${chalk.cyan(port)}`);
    console.log(`   路径: ${chalk.cyan(`sub-apps/${appName}`)}`);
    
    console.log(chalk.blue('\n🚀 下一步操作:'));
    console.log(`   1. 启动子应用:`);
    console.log(`      ${chalk.yellow(`cd sub-apps/${appName} && npm run dev`)}`);
    console.log(`   2. 访问应用:`);
    console.log(`      独立访问: ${chalk.cyan(`http://localhost:${port}`)}`);
    console.log(`      基座访问: ${chalk.cyan(`http://localhost:3000/${appName}`)}`);
    
    console.log(chalk.green('\n✨ 开始开发你的微前端应用吧！'));
  }
}
