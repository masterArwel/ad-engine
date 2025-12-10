#!/usr/bin/env node

/**
 * 基本使用示例
 */

const { MicroFrontendCLI } = require('../dist/index.js');

async function basicExample() {
  console.log('🚀 基本使用示例\n');
  
  // 创建 CLI 实例
  const cli = new MicroFrontendCLI({
    defaultOutputDir: 'examples/apps',
    defaultPortStart: 4000
  });
  
  // 获取 CLI 信息
  const info = cli.getInfo();
  console.log('CLI 版本:', info.version);
  console.log('支持的框架:', info.plugins.map(p => p.framework).join(', '));
  console.log('配置信息:', JSON.stringify(info.config, null, 2));
  
  // 创建应用（交互式）
  // await cli.createApp();
}

async function programmaticExample() {
  console.log('🔧 编程式使用示例\n');
  
  const cli = new MicroFrontendCLI();
  
  // 编程式创建应用
  await cli.createApp({
    config: {
      name: 'example-vue-app',
      framework: 'vue',
      port: 4001,
      useRouter: true,
      useStateManagement: true,
      cssPreprocessor: 'scss',
      useEslint: true,
      usePrettier: true,
      addToMainApp: false,
      outputDir: 'examples/apps'
    },
    skipInstall: true, // 跳过依赖安装以加快示例运行
    verbose: true
  });
}

// 运行示例
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'basic':
      basicExample().catch(console.error);
      break;
    case 'programmatic':
      programmaticExample().catch(console.error);
      break;
    default:
      console.log('使用方法:');
      console.log('  node examples/basic-usage.js basic        # 基本使用示例');
      console.log('  node examples/basic-usage.js programmatic # 编程式使用示例');
  }
}
