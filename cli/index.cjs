#!/usr/bin/env node

/**
 * 微前端子应用创建 CLI 工具
 * 使用方法: npm run create-app
 */

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const program = new Command();

// CLI 版本和描述
program
  .name('micro-app-cli')
  .description('微前端子应用创建工具')
  .version('1.0.0');

// 主命令
program
  .command('create')
  .description('创建新的微前端子应用')
  .action(async () => {
    console.log(chalk.blue.bold('\n🚀 欢迎使用微前端子应用创建工具\n'));
    
    try {
      // 获取用户输入
      const answers = await promptQuestions();
      
      // 验证输入
      const validation = validateAnswers(answers);
      if (!validation.valid) {
        console.log(chalk.red(`❌ ${validation.message}`));
        process.exit(1);
      }
      
      // 创建应用
      await createApplication(answers);
      
      // 显示完成信息
      showCompletionInfo(answers);
      
    } catch (error) {
      console.log(chalk.red(`❌ 创建失败: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * 交互式问答
 */
async function promptQuestions() {
  const questions = [
    {
      type: 'input',
      name: 'appName',
      message: '请输入应用名称:',
      validate: (input) => {
        if (!input.trim()) {
          return '应用名称不能为空';
        }
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return '应用名称只能包含小写字母、数字和连字符，且必须以字母开头';
        }
        return true;
      },
      filter: (input) => input.trim().toLowerCase()
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
        },
        {
          name: '🟠 Angular + TypeScript',
          value: 'angular',
          short: 'Angular'
        }
      ]
    },
    {
      type: 'input',
      name: 'port',
      message: '请输入开发服务器端口:',
      default: (answers) => {
        // 根据现有应用数量自动分配端口
        const subAppsDir = path.join(process.cwd(), 'sub-apps');
        let defaultPort = 3001;
        
        if (fs.existsSync(subAppsDir)) {
          const apps = fs.readdirSync(subAppsDir).filter(dir => 
            fs.statSync(path.join(subAppsDir, dir)).isDirectory()
          );
          defaultPort = 3001 + apps.length;
        }
        
        return defaultPort.toString();
      },
      validate: (input) => {
        const port = parseInt(input);
        if (isNaN(port) || port < 1000 || port > 65535) {
          return '端口号必须在 1000-65535 之间';
        }
        return true;
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
      default: true,
      when: (answers) => answers.framework !== 'angular'
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

  return await inquirer.prompt(questions);
}

/**
 * 验证用户输入
 */
function validateAnswers(answers) {
  // 检查应用名称是否已存在
  const appPath = path.join(process.cwd(), 'sub-apps', answers.appName);
  if (fs.existsSync(appPath)) {
    return {
      valid: false,
      message: `应用 "${answers.appName}" 已存在`
    };
  }

  // 检查端口是否被占用
  try {
    execSync(`lsof -i :${answers.port}`, { stdio: 'ignore' });
    return {
      valid: false,
      message: `端口 ${answers.port} 已被占用`
    };
  } catch (error) {
    // 端口未被占用，继续
  }

  return { valid: true };
}

/**
 * 创建应用
 */
async function createApplication(answers) {
  const { appName, framework, port } = answers;
  
  console.log(chalk.blue(`\n📦 开始创建 ${framework.toUpperCase()} 应用: ${appName}\n`));

  // 确保 sub-apps 目录存在
  const subAppsDir = path.join(process.cwd(), 'sub-apps');
  await fs.ensureDir(subAppsDir);

  const appPath = path.join(subAppsDir, appName);
  
  // 创建应用基础结构
  const spinner = ora('正在创建项目结构...').start();
  
  try {
    // 根据框架类型创建应用
    switch (framework) {
      case 'vue':
        await createVueApp(appPath, answers);
        break;
      case 'react':
        await createReactApp(appPath, answers);
        break;
      case 'angular':
        await createAngularApp(appPath, answers);
        break;
    }
    
    spinner.succeed('项目结构创建完成');
    
    // 安装依赖
    const installSpinner = ora('正在安装依赖...').start();
    process.chdir(appPath);
    execSync('npm install', { stdio: 'ignore' });
    installSpinner.succeed('依赖安装完成');
    
    // 返回根目录
    process.chdir(path.join('..', '..'));
    
    // 注册到基座应用
    if (answers.addToMainApp) {
      const registerSpinner = ora('正在注册到基座应用...').start();
      await registerToMainApp(answers);
      registerSpinner.succeed('注册到基座应用完成');
    }
    
  } catch (error) {
    spinner.fail('创建失败');
    throw error;
  }
}

/**
 * 创建 Vue 应用
 */
async function createVueApp(appPath, answers) {
  const { appName, port, useRouter, useStateManagement, cssPreprocessor, useEslint } = answers;
  
  // 创建基础目录结构
  await fs.ensureDir(appPath);
  await fs.ensureDir(path.join(appPath, 'src'));
  await fs.ensureDir(path.join(appPath, 'src/components'));
  await fs.ensureDir(path.join(appPath, 'src/views'));
  await fs.ensureDir(path.join(appPath, 'public'));

  // 创建 package.json
  const packageJson = {
    name: appName,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vue-tsc && vite build',
      preview: 'vite preview',
      ...(useEslint && { lint: 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore' })
    },
    dependencies: {
      vue: '^3.4.0',
      ...(useRouter && { 'vue-router': '^4.2.5' }),
      ...(useStateManagement && { pinia: '^2.1.7' }),
      'vite-plugin-qiankun': '^1.0.15'
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.0.0',
      'typescript': '^5.3.0',
      'vue-tsc': '^1.8.25',
      'vite': '^5.0.0',
      ...(cssPreprocessor !== 'css' && { [cssPreprocessor]: 'latest' }),
      ...(useEslint && {
        eslint: '^8.57.0',
        '@typescript-eslint/eslint-plugin': '^6.14.0',
        '@typescript-eslint/parser': '^6.14.0',
        'eslint-plugin-vue': '^9.17.0'
      })
    }
  };

  await fs.writeJson(path.join(appPath, 'package.json'), packageJson, { spaces: 2 });

  // 创建 vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('${appName}', { useDevMode: true })
  ],
  server: {
    port: ${port},
    cors: true,
    origin: 'http://localhost:${port}'
  },
  build: {
    target: 'esnext',
    lib: {
      name: '${appName}',
      entry: './src/main.ts',
      formats: ['umd']
    }
  }
})`;

  await fs.writeFile(path.join(appPath, 'vite.config.ts'), viteConfig);

  // 创建 tsconfig.json
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

  await fs.writeJson(path.join(appPath, 'tsconfig.json'), tsConfig, { spaces: 2 });

  // 创建主入口文件
  const mainTs = `import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'${useStateManagement ? `
import { createPinia } from 'pinia'` : ''}
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'${useRouter ? `
import routes from './router'` : ''}

let app: any
let router: any

function render(props: any = {}) {
  const { container, routerBase } = props
  ${useRouter ? `
  router = createRouter({
    history: createWebHistory(routerBase || '/${appName}/'),
    routes
  })` : ''}
  
  app = createApp(App)${useStateManagement ? `
  app.use(createPinia())` : ''}${useRouter ? `
  app.use(router)` : ''}
  
  const containerEl = container ? container.querySelector('#app') : '#app'
  app.mount(containerEl)
}

renderWithQiankun({
  mount(props) {
    console.log('${appName} mount', props)
    render(props)
  },
  bootstrap() {
    console.log('${appName} bootstrap')
  },
  unmount() {
    console.log('${appName} unmount')
    app?.unmount()
    app = null
    router = null
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}`;

  await fs.writeFile(path.join(appPath, 'src/main.ts'), mainTs);

  // 创建 App.vue
  const appVue = `<template>
  <div id="app">
    <header class="app-header">
      <h1>{{ title }}</h1>
      <p>这是一个 Vue 3 微前端子应用</p>
    </header>
    
    ${useRouter ? `<router-view />` : `<main class="app-main">
      <HelloWorld />
    </main>`}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'${!useRouter ? `
import HelloWorld from './components/HelloWorld.vue'` : ''}

const title = ref('${appName}')
</script>

<style${cssPreprocessor !== 'css' ? ` lang="${cssPreprocessor}"` : ''}>
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

  await fs.writeFile(path.join(appPath, 'src/App.vue'), appVue);

  // 创建组件
  const helloWorld = `<template>
  <div class="hello-world">
    <h2>欢迎使用 ${appName}</h2>
    <p>这是一个基于 Vue 3 + TypeScript + Vite 的微前端子应用</p>
    
    <div class="features">
      <h3>特性</h3>
      <ul>
        <li>✅ Vue 3 Composition API</li>
        <li>✅ TypeScript 支持</li>
        <li>✅ Vite 构建工具</li>
        <li>✅ qiankun 微前端集成</li>${useRouter ? `
        <li>✅ Vue Router 路由管理</li>` : ''}${useStateManagement ? `
        <li>✅ Pinia 状态管理</li>` : ''}
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style${cssPreprocessor !== 'css' ? ` lang="${cssPreprocessor}"` : ''} scoped>
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

  await fs.writeFile(path.join(appPath, 'src/components/HelloWorld.vue'), helloWorld);

  // 创建路由文件（如果需要）
  if (useRouter) {
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

    await fs.writeFile(path.join(appPath, 'src/router/index.ts'), routerTs);

    // 创建视图文件
    const homeVue = `<template>
  <div class="home">
    <h2>首页</h2>
    <p>欢迎来到 ${appName} 首页</p>
    <router-link to="/about">关于我们</router-link>
  </div>
</template>

<script setup lang="ts">
// 首页逻辑
</script>

<style${cssPreprocessor !== 'css' ? ` lang="${cssPreprocessor}"` : ''} scoped>
.home {
  padding: 2rem;
  text-align: center;
}
</style>`;

    await fs.writeFile(path.join(appPath, 'src/views/Home.vue'), homeVue);

    const aboutVue = `<template>
  <div class="about">
    <h2>关于我们</h2>
    <p>这是 ${appName} 的关于页面</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup lang="ts">
// 关于页面逻辑
</script>

<style${cssPreprocessor !== 'css' ? ` lang="${cssPreprocessor}"` : ''} scoped>
.about {
  padding: 2rem;
  text-align: center;
}
</style>`;

    await fs.writeFile(path.join(appPath, 'src/views/About.vue'), aboutVue);
  }

  // 创建 index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/svg+xml" href="/vite.svg">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`;

  await fs.writeFile(path.join(appPath, 'index.html'), indexHtml);

  // 创建环境类型定义
  const envDts = `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}`;

  await fs.writeFile(path.join(appPath, 'src/env.d.ts'), envDts);
}

/**
 * 创建 React 应用
 */
async function createReactApp(appPath, answers) {
  const { appName, port, useRouter, useStateManagement, cssPreprocessor, useEslint } = answers;
  
  // 创建基础目录结构
  await fs.ensureDir(appPath);
  await fs.ensureDir(path.join(appPath, 'src'));
  await fs.ensureDir(path.join(appPath, 'src/components'));
  await fs.ensureDir(path.join(appPath, 'src/pages'));
  await fs.ensureDir(path.join(appPath, 'public'));

  // 创建 package.json
  const packageJson = {
    name: appName,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
      ...(useEslint && { lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0' })
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      ...(useRouter && { 'react-router-dom': '^6.20.0' }),
      ...(useStateManagement && { zustand: '^4.4.7' }),
      'vite-plugin-qiankun': '^1.0.15'
    },
    devDependencies: {
      '@types/react': '^18.2.43',
      '@types/react-dom': '^18.2.17',
      '@vitejs/plugin-react': '^4.2.1',
      'typescript': '^5.2.2',
      'vite': '^5.0.8',
      ...(useRouter && { '@types/react-router-dom': '^5.3.3' }),
      ...(cssPreprocessor !== 'css' && { [cssPreprocessor]: 'latest' }),
      ...(useEslint && {
        eslint: '^8.55.0',
        '@typescript-eslint/eslint-plugin': '^6.14.0',
        '@typescript-eslint/parser': '^6.14.0',
        'eslint-plugin-react-hooks': '^4.6.0',
        'eslint-plugin-react-refresh': '^0.4.5'
      })
    }
  };

  await fs.writeJson(path.join(appPath, 'package.json'), packageJson, { spaces: 2 });

  // 创建 vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    react(),
    qiankun('${appName}', { useDevMode: true })
  ],
  server: {
    port: ${port},
    cors: true,
    origin: 'http://localhost:${port}'
  },
  build: {
    target: 'esnext',
    lib: {
      name: '${appName}',
      entry: './src/main.tsx',
      formats: ['umd']
    }
  }
})`;

  await fs.writeFile(path.join(appPath, 'vite.config.ts'), viteConfig);

  // 创建 tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*']
      }
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }]
  };

  await fs.writeJson(path.join(appPath, 'tsconfig.json'), tsConfig, { spaces: 2 });

  // 创建主入口文件
  const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'${useRouter ? `
import { BrowserRouter } from 'react-router-dom'` : ''}
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import App from './App'
import './index.css'

let root: ReactDOM.Root | null = null

function render(props: any = {}) {
  const { container, routerBase } = props
  const containerEl = container ? container.querySelector('#root') : document.getElementById('root')
  
  if (!root) {
    root = ReactDOM.createRoot(containerEl!)
  }
  
  root.render(
    <React.StrictMode>${useRouter ? `
      <BrowserRouter basename={routerBase || '/${appName}'}>
        <App />
      </BrowserRouter>` : `
      <App />`}
    </React.StrictMode>
  )
}

renderWithQiankun({
  mount(props) {
    console.log('${appName} mount', props)
    render(props)
  },
  bootstrap() {
    console.log('${appName} bootstrap')
  },
  unmount() {
    console.log('${appName} unmount')
    if (root) {
      root.unmount()
      root = null
    }
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}`;

  await fs.writeFile(path.join(appPath, 'src/main.tsx'), mainTsx);

  // 创建 App.tsx
  const appTsx = `import React from 'react'${useRouter ? `
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'` : `
import HelloWorld from './components/HelloWorld'`}
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>${appName}</h1>
        <p>这是一个 React 微前端子应用</p>
      </header>
      
      ${useRouter ? `<nav className="app-nav">
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>` : `<main className="app-main">
        <HelloWorld />
      </main>`}
    </div>
  )
}

export default App`;

  await fs.writeFile(path.join(appPath, 'src/App.tsx'), appTsx);

  // 创建 App.css
  const appCss = `.App {
  min-height: 100vh;
}

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

.app-nav {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  margin-bottom: 2rem;
}

.app-nav a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.app-nav a:hover {
  text-decoration: underline;
}

.app-main {
  padding: 0 2rem;
}`;

  await fs.writeFile(path.join(appPath, 'src/App.css'), appCss);

  // 创建组件
  if (!useRouter) {
    const helloWorld = `import React from 'react'

const HelloWorld: React.FC = () => {
  return (
    <div className="hello-world">
      <h2>欢迎使用 ${appName}</h2>
      <p>这是一个基于 React + TypeScript + Vite 的微前端子应用</p>
      
      <div className="features">
        <h3>特性</h3>
        <ul>
          <li>✅ React 18</li>
          <li>✅ TypeScript 支持</li>
          <li>✅ Vite 构建工具</li>
          <li>✅ qiankun 微前端集成</li>${useStateManagement ? `
          <li>✅ Zustand 状态管理</li>` : ''}
        </ul>
      </div>
    </div>
  )
}

export default HelloWorld`;

    await fs.writeFile(path.join(appPath, 'src/components/HelloWorld.tsx'), helloWorld);
  }

  // 创建页面文件（如果使用路由）
  if (useRouter) {
    const homePage = `import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="home">
      <h2>首页</h2>
      <p>欢迎来到 ${appName} 首页</p>
    </div>
  )
}

export default Home`;

    await fs.writeFile(path.join(appPath, 'src/pages/Home.tsx'), homePage);

    const aboutPage = `import React from 'react'

const About: React.FC = () => {
  return (
    <div className="about">
      <h2>关于我们</h2>
      <p>这是 ${appName} 的关于页面</p>
    </div>
  )
}

export default About`;

    await fs.writeFile(path.join(appPath, 'src/pages/About.tsx'), aboutPage);
  }

  // 创建全局样式
  const indexCss = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

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

.home, .about {
  padding: 2rem;
  text-align: center;
}`;

  await fs.writeFile(path.join(appPath, 'src/index.css'), indexCss);

  // 创建 index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  await fs.writeFile(path.join(appPath, 'index.html'), indexHtml);
}

/**
 * 创建 Angular 应用 (简化版本)
 */
async function createAngularApp(appPath, answers) {
  // Angular 应用创建逻辑（简化实现）
  console.log(chalk.yellow('Angular 应用创建功能正在开发中...'));
  throw new Error('Angular 应用创建功能暂未实现');
}

/**
 * 注册到基座应用
 */
async function registerToMainApp(answers) {
  const { appName, port } = answers;
  
  // 更新微应用配置
  const microAppsPath = path.join(process.cwd(), 'src/config/microApps.ts');
  
  if (fs.existsSync(microAppsPath)) {
    let content = await fs.readFile(microAppsPath, 'utf-8');
    
    // 在 devMicroApps 数组中添加新应用
    const newApp = `  {
    name: '${appName}',
    entry: 'http://localhost:${port}',
    container: '#subapp-viewport',
    activeRule: '/${appName}',
    props: {
      routerBase: '/${appName}',
    },
  },`;

    // 查找 devMicroApps 数组的结束位置
    const devMicroAppsMatch = content.match(/export const devMicroApps[^=]*=\s*\[([\s\S]*?)\];/);
    if (devMicroAppsMatch) {
      const arrayContent = devMicroAppsMatch[1];
      const newArrayContent = arrayContent.trim() ? `${arrayContent.trim()}\n${newApp}` : newApp;
      content = content.replace(devMicroAppsMatch[0], `export const devMicroApps: MicroApp[] = [\n${newArrayContent}\n];`);
    }

    await fs.writeFile(microAppsPath, content);
  }

  // 更新路由配置
  const routerPath = path.join(process.cwd(), 'src/router/index.tsx');
  
  if (fs.existsSync(routerPath)) {
    let content = await fs.readFile(routerPath, 'utf-8');
    
    // 添加新的路由
    const newRoute = `      {
        path: '${appName}/*',
        element: <MicroAppContainer />,
      },`;

    // 查找 children 数组
    const childrenMatch = content.match(/(children:\s*\[)([\s\S]*?)(\s*\])/);
    if (childrenMatch) {
      const existingRoutes = childrenMatch[2];
      const newRoutes = existingRoutes.trim() ? `${existingRoutes}\n${newRoute}` : `\n${newRoute}\n`;
      content = content.replace(childrenMatch[0], `${childrenMatch[1]}${newRoutes}${childrenMatch[3]}`);
    }

    await fs.writeFile(routerPath, content);
  }

  // 更新导航菜单
  const layoutPath = path.join(process.cwd(), 'src/components/Layout.tsx');
  
  if (fs.existsSync(layoutPath)) {
    let content = await fs.readFile(layoutPath, 'utf-8');
    
    // 添加导航链接
    const newNavLink = `          <Link 
            to="/${appName}" 
            className={location.pathname.startsWith('/${appName}') ? 'active' : ''}
          >
            ${appName}
          </Link>`;

    // 查找导航区域
    const navMatch = content.match(/(<nav className="header-nav">[\s\S]*?)(\s*<\/nav>)/);
    if (navMatch) {
      const existingNav = navMatch[1];
      const newNav = `${existingNav}\n${newNavLink}`;
      content = content.replace(navMatch[0], `${newNav}${navMatch[2]}`);
    }

    await fs.writeFile(layoutPath, content);
  }
}

/**
 * 显示完成信息
 */
function showCompletionInfo(answers) {
  const { appName, framework, port } = answers;
  
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
  
  if (answers.addToMainApp) {
    console.log(`   3. 基座应用已自动更新配置`);
  } else {
    console.log(`   3. 手动注册到基座应用:`);
    console.log(`      编辑 ${chalk.yellow('src/config/microApps.ts')}`);
    console.log(`      编辑 ${chalk.yellow('src/router/index.tsx')}`);
  }
  
  console.log(chalk.blue('\n💡 管理命令:'));
  console.log(`   启动所有应用: ${chalk.yellow('npm run start:all')}`);
  console.log(`   停止所有应用: ${chalk.yellow('npm run stop:all')}`);
  console.log(`   创建新应用: ${chalk.yellow('npm run create-app')}`);
  
  console.log(chalk.green('\n✨ 开始开发你的微前端应用吧！'));
}

// 解析命令行参数
if (process.argv.length === 2) {
  // 如果没有提供命令，默认执行 create
  program.parse(['node', 'cli', 'create']);
} else {
  program.parse();
}
