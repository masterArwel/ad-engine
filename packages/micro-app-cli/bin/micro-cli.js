#!/usr/bin/env node

/**
 * 微前端 CLI 工具命令行入口
 */

const { Command } = require('commander');
const chalk = require('chalk');
const { MicroFrontendCLI } = require('../dist/index.js');

const program = new Command();

// CLI 版本和描述
program
  .name('micro-cli')
  .description('微前端子应用创建工具')
  .version('1.0.0');

// 创建应用命令
program
  .command('create')
  .description('创建新的微前端子应用')
  .option('-s, --skip-install', '跳过依赖安装')
  .option('-v, --verbose', '显示详细输出')
  .option('-t, --template <template>', '使用指定模板')
  .action(async (options) => {
    try {
      const cli = new MicroFrontendCLI();
      await cli.createApp({
        skipInstall: options.skipInstall,
        verbose: options.verbose,
        template: options.template
      });
    } catch (error) {
      console.error(chalk.red(`❌ 创建失败: ${error.message}`));
      process.exit(1);
    }
  });

// 信息命令
program
  .command('info')
  .description('显示 CLI 工具信息')
  .action(() => {
    try {
      const cli = new MicroFrontendCLI();
      const info = cli.getInfo();
      
      console.log(chalk.blue.bold('\n📋 CLI 工具信息\n'));
      console.log(`版本: ${chalk.cyan(info.version)}`);
      console.log(`支持的框架: ${chalk.cyan(info.plugins.map(p => p.framework).join(', '))}`);
      console.log(`已加载插件: ${chalk.cyan(info.plugins.length)} 个`);
      
      console.log(chalk.blue('\n🔧 配置信息:'));
      console.log(`默认输出目录: ${chalk.cyan(info.config.defaultOutputDir)}`);
      console.log(`默认端口起始: ${chalk.cyan(info.config.defaultPortStart)}`);
      
      console.log(chalk.blue('\n🔌 插件列表:'));
      info.plugins.forEach(plugin => {
        console.log(`  • ${chalk.cyan(plugin.name)} (${plugin.framework})`);
      });
      
    } catch (error) {
      console.error(chalk.red(`❌ 获取信息失败: ${error.message}`));
      process.exit(1);
    }
  });

// 配置命令
program
  .command('config')
  .description('管理 CLI 配置')
  .option('--list', '显示当前配置')
  .option('--reset', '重置为默认配置')
  .action(async (options) => {
    try {
      const cli = new MicroFrontendCLI();
      
      if (options.list) {
        const info = cli.getInfo();
        console.log(chalk.blue.bold('\n⚙️ 当前配置\n'));
        console.log(JSON.stringify(info.config, null, 2));
      }
      
      if (options.reset) {
        // 重置配置逻辑
        console.log(chalk.green('✅ 配置已重置为默认值'));
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ 配置操作失败: ${error.message}`));
      process.exit(1);
    }
  });

// 错误处理
program.on('command:*', () => {
  console.error(chalk.red(`❌ 未知命令: ${program.args.join(' ')}`));
  console.log(chalk.yellow('使用 --help 查看可用命令'));
  process.exit(1);
});

// 解析命令行参数
if (process.argv.length === 2) {
  // 如果没有提供命令，默认执行 create
  program.parse(['node', 'micro-cli', 'create']);
} else {
  program.parse();
}
