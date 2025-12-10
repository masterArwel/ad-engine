#!/usr/bin/env node

/**
 * 自定义插件开发示例
 */

const { MicroFrontendCLI, PluginManager } = require('../dist/index.js');
const path = require('path');
const fs = require('fs-extra');

// 自定义 Svelte 插件示例
const SveltePlugin = {
  name: 'svelte-plugin',
  framework: 'svelte',
  
  async createApp(appPath, config) {
    console.log(`创建 Svelte 应用: ${config.name}`);
    
    // 创建基础目录结构
    await fs.ensureDir(appPath);
    await fs.ensureDir(path.join(appPath, 'src'));
    await fs.ensureDir(path.join(appPath, 'public'));
    
    // 生成 package.json
    const packageJson = {
      name: config.name,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        svelte: '^4.0.0'
      },
      devDependencies: {
        '@sveltejs/vite-plugin-svelte': '^2.0.0',
        'vite': '^4.0.0',
        'svelte-check': '^3.0.0',
        'typescript': '^5.0.0'
      }
    };
    
    await fs.writeJson(path.join(appPath, 'package.json'), packageJson, { spaces: 2 });
    
    // 生成 vite.config.js
    const viteConfig = `import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: ${config.port}
  }
})`;
    
    await fs.writeFile(path.join(appPath, 'vite.config.js'), viteConfig);
    
    // 生成 App.svelte
    const appSvelte = `<script>
  export let name = '${config.name}';
</script>

<main>
  <h1>Hello {name}!</h1>
  <p>这是一个 Svelte 微前端应用</p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>`;
    
    await fs.writeFile(path.join(appPath, 'src/App.svelte'), appSvelte);
    
    // 生成 main.js
    const mainJs = `import App from './App.svelte'

const app = new App({
  target: document.getElementById('app')
})

export default app`;
    
    await fs.writeFile(path.join(appPath, 'src/main.js'), mainJs);
    
    // 生成 index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`;
    
    await fs.writeFile(path.join(appPath, 'index.html'), indexHtml);
    
    console.log(`✅ Svelte 应用 ${config.name} 创建完成`);
  },
  
  getDefaultConfig() {
    return {
      useRouter: false,
      useStateManagement: false,
      cssPreprocessor: 'css',
      useEslint: false,
      usePrettier: false
    };
  },
  
  validateConfig(config) {
    return config.framework === 'svelte' && !!config.name && !!config.port;
  }
};

async function customPluginExample() {
  console.log('🔌 自定义插件示例\n');
  
  // 创建 CLI 实例
  const cli = new MicroFrontendCLI({
    defaultOutputDir: 'examples/apps',
    defaultPortStart: 5000
  });
  
  // 注册自定义插件
  cli.pluginManager.register(SveltePlugin);
  
  // 显示插件信息
  const info = cli.getInfo();
  console.log('已注册的插件:');
  info.plugins.forEach(plugin => {
    console.log(`  • ${plugin.name} (${plugin.framework})`);
  });
  
  // 使用自定义插件创建应用
  try {
    await cli.pluginManager.createApp('svelte', 'examples/apps/my-svelte-app', {
      name: 'my-svelte-app',
      framework: 'svelte',
      port: 5001,
      useRouter: false,
      useStateManagement: false,
      cssPreprocessor: 'css',
      useEslint: false,
      usePrettier: false,
      addToMainApp: false
    });
    
    console.log('\n✅ 自定义 Svelte 应用创建成功！');
    console.log('📁 应用路径: examples/apps/my-svelte-app');
    console.log('🚀 启动命令: cd examples/apps/my-svelte-app && npm install && npm run dev');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
  }
}

// 运行示例
if (require.main === module) {
  customPluginExample().catch(console.error);
}
