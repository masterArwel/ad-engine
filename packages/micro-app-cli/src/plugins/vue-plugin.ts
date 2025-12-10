import * as path from 'path';
import { FrameworkPlugin, MicroAppConfig } from '../types';
import { CLIFileGenerator, CLIDependencyManager } from '../utils';

/**
 * Vue 框架插件
 */
export const VuePlugin: FrameworkPlugin = {
  name: 'vue-plugin',
  framework: 'vue',

  async createApp(appPath: string, config: MicroAppConfig): Promise<void> {
    const fileGenerator = new CLIFileGenerator();
    const dependencyManager = new CLIDependencyManager();

    // 创建基础目录结构
    await fileGenerator.generateDir(appPath);
    await fileGenerator.generateDir(path.join(appPath, 'src'));
    await fileGenerator.generateDir(path.join(appPath, 'src/components'));
    await fileGenerator.generateDir(path.join(appPath, 'src/views'));
    await fileGenerator.generateDir(path.join(appPath, 'public'));

    // 生成 package.json
    const packageJson = {
      name: config.name,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vue-tsc && vite build',
        preview: 'vite preview',
        ...(config.useEslint && { lint: 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore' })
      },
      dependencies: {
        vue: '^3.4.0',
        ...(config.useRouter && { 'vue-router': '^4.2.5' }),
        ...(config.useStateManagement && { pinia: '^2.1.7' }),
        'vite-plugin-qiankun': '^1.0.15'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^5.0.0',
        'typescript': '^5.3.0',
        'vue-tsc': '^1.8.25',
        'vite': '^5.0.0',
        ...(config.cssPreprocessor !== 'css' && { [config.cssPreprocessor]: 'latest' }),
        ...(config.useEslint && {
          eslint: '^8.57.0',
          '@typescript-eslint/eslint-plugin': '^6.14.0',
          '@typescript-eslint/parser': '^6.14.0',
          'eslint-plugin-vue': '^9.17.0'
        })
      }
    };

    await fileGenerator.generateFile(
      path.join(appPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // 生成 vite.config.ts
    const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('${config.name}', { useDevMode: true })
  ],
  server: {
    port: ${config.port},
    cors: true,
    origin: 'http://localhost:${config.port}'
  },
  build: {
    target: 'esnext',
    lib: {
      name: '${config.name}',
      entry: './src/main.ts',
      formats: ['umd']
    }
  }
})`;

    await fileGenerator.generateFile(path.join(appPath, 'vite.config.ts'), viteConfig);

    // 生成 tsconfig.json
    const tsConfig = {
      extends: '@vue/tsconfig/tsconfig.dom.json',
      include: ['env.d.ts', 'src/**/*', 'src/**/*.vue'],
      exclude: ['src/**/__tests__/*'],
      compilerOptions: {
        composite: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      }
    };

    await fileGenerator.generateFile(
      path.join(appPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );

    // 生成主入口文件
    const mainTs = `import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'${config.useStateManagement ? `
import { createPinia } from 'pinia'` : ''}
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'${config.useRouter ? `
import routes from './router'` : ''}

let app: any
let router: any

function render(props: any = {}) {
  const { container, routerBase } = props
  ${config.useRouter ? `
  router = createRouter({
    history: createWebHistory(routerBase || '/${config.name}/'),
    routes
  })` : ''}
  
  app = createApp(App)${config.useStateManagement ? `
  app.use(createPinia())` : ''}${config.useRouter ? `
  app.use(router)` : ''}
  
  const containerEl = container ? container.querySelector('#app') : '#app'
  app.mount(containerEl)
}

renderWithQiankun({
  mount(props) {
    console.log('${config.name} mount', props)
    render(props)
  },
  bootstrap() {
    console.log('${config.name} bootstrap')
  },
  unmount() {
    console.log('${config.name} unmount')
    app?.unmount()
    app = null
    router = null
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}`;

    await fileGenerator.generateFile(path.join(appPath, 'src/main.ts'), mainTs);

    // 生成 App.vue
    const appVue = `<template>
  <div id="app">
    <header class="app-header">
      <h1>{{ title }}</h1>
      <p>这是一个 Vue 3 微前端子应用</p>
    </header>
    
    ${config.useRouter ? `<router-view />` : `<main class="app-main">
      <HelloWorld />
    </main>`}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'${!config.useRouter ? `
import HelloWorld from './components/HelloWorld.vue'` : ''}

const title = ref('${config.name}')
</script>

<style${config.cssPreprocessor !== 'css' ? ` lang="${config.cssPreprocessor}"` : ''}>
.app-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2.5rem;
}

.app-main {
  padding: 0 2rem;
}
</style>`;

    await fileGenerator.generateFile(path.join(appPath, 'src/App.vue'), appVue);

    // 生成组件
    if (!config.useRouter) {
      const helloWorld = `<template>
  <div class="hello-world">
    <h2>欢迎使用 ${config.name}</h2>
    <p>这是一个基于 Vue 3 + TypeScript + Vite 的微前端子应用</p>
    
    <div class="features">
      <h3>特性</h3>
      <ul>
        <li>✅ Vue 3 Composition API</li>
        <li>✅ TypeScript 支持</li>
        <li>✅ Vite 构建工具</li>
        <li>✅ qiankun 微前端集成</li>${config.useStateManagement ? `
        <li>✅ Pinia 状态管理</li>` : ''}
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style${config.cssPreprocessor !== 'css' ? ` lang="${config.cssPreprocessor}"` : ''} scoped>
.hello-world {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.features {
  margin-top: 2rem;
  text-align: left;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
</style>`;

      await fileGenerator.generateFile(path.join(appPath, 'src/components/HelloWorld.vue'), helloWorld);
    }

    // 生成路由文件（如果需要）
    if (config.useRouter) {
      await fileGenerator.generateDir(path.join(appPath, 'src/router'));
      
      const routerTs = `import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]

export default routes`;

      await fileGenerator.generateFile(path.join(appPath, 'src/router/index.ts'), routerTs);

      // 生成视图文件
      const homeVue = `<template>
  <div class="home">
    <h2>首页</h2>
    <p>欢迎来到 ${config.name} 首页</p>
    <router-link to="/about">关于我们</router-link>
  </div>
</template>

<script setup lang="ts">
// 首页逻辑
</script>

<style${config.cssPreprocessor !== 'css' ? ` lang="${config.cssPreprocessor}"` : ''} scoped>
.home {
  padding: 2rem;
  text-align: center;
}
</style>`;

      await fileGenerator.generateFile(path.join(appPath, 'src/views/Home.vue'), homeVue);

      const aboutVue = `<template>
  <div class="about">
    <h2>关于我们</h2>
    <p>这是 ${config.name} 的关于页面</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup lang="ts">
// 关于页面逻辑
</script>

<style${config.cssPreprocessor !== 'css' ? ` lang="${config.cssPreprocessor}"` : ''} scoped>
.about {
  padding: 2rem;
  text-align: center;
}
</style>`;

      await fileGenerator.generateFile(path.join(appPath, 'src/views/About.vue'), aboutVue);
    }

    // 生成 index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/svg+xml" href="/vite.svg">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`;

    await fileGenerator.generateFile(path.join(appPath, 'index.html'), indexHtml);

    // 生成环境类型定义
    const envDts = `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}`;

    await fileGenerator.generateFile(path.join(appPath, 'src/env.d.ts'), envDts);
  },

  getDefaultConfig(): Partial<MicroAppConfig> {
    return {
      useRouter: true,
      useStateManagement: true,
      cssPreprocessor: 'css',
      useEslint: true,
      usePrettier: true
    };
  },

  validateConfig(config: MicroAppConfig): boolean {
    // Vue 特定的配置验证
    return config.framework === 'vue' && !!config.name && !!config.port;
  }
};
