import * as path from 'path';
import { FrameworkPlugin, MicroAppConfig } from '../types';
import { CLIFileGenerator, CLIDependencyManager } from '../utils';

/**
 * React 框架插件
 */
export const ReactPlugin: FrameworkPlugin = {
  name: 'react-plugin',
  framework: 'react',

  async createApp(appPath: string, config: MicroAppConfig): Promise<void> {
    const fileGenerator = new CLIFileGenerator();
    const dependencyManager = new CLIDependencyManager();

    // 创建基础目录结构
    await fileGenerator.generateDir(appPath);
    await fileGenerator.generateDir(path.join(appPath, 'src'));
    await fileGenerator.generateDir(path.join(appPath, 'src/components'));
    await fileGenerator.generateDir(path.join(appPath, 'src/pages'));
    await fileGenerator.generateDir(path.join(appPath, 'public'));

    // 生成 package.json
    const packageJson = {
      name: config.name,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
        ...(config.useEslint && { lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0' })
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        ...(config.useRouter && { 'react-router-dom': '^6.20.0' }),
        ...(config.useStateManagement && { zustand: '^4.4.7' }),
        'vite-plugin-qiankun': '^1.0.15'
      },
      devDependencies: {
        '@types/react': '^18.2.43',
        '@types/react-dom': '^18.2.17',
        '@vitejs/plugin-react': '^4.2.1',
        'typescript': '^5.2.2',
        'vite': '^5.0.8',
        ...(config.useRouter && { '@types/react-router-dom': '^5.3.3' }),
        ...(config.cssPreprocessor !== 'css' && { [config.cssPreprocessor]: 'latest' }),
        ...(config.useEslint && {
          eslint: '^8.55.0',
          '@typescript-eslint/eslint-plugin': '^6.14.0',
          '@typescript-eslint/parser': '^6.14.0',
          'eslint-plugin-react-hooks': '^4.6.0',
          'eslint-plugin-react-refresh': '^0.4.5'
        })
      }
    };

    await fileGenerator.generateFile(
      path.join(appPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // 生成 vite.config.ts
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    react(),
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
      entry: './src/main.tsx',
      formats: ['umd']
    }
  }
})`;

    await fileGenerator.generateFile(path.join(appPath, 'vite.config.ts'), viteConfig);

    // 生成 tsconfig.json
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

    await fileGenerator.generateFile(
      path.join(appPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );

    // 生成主入口文件
    const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'${config.useRouter ? `
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
    <React.StrictMode>${config.useRouter ? `
      <BrowserRouter basename={routerBase || '/${config.name}'}>
        <App />
      </BrowserRouter>` : `
      <App />`}
    </React.StrictMode>
  )
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
    if (root) {
      root.unmount()
      root = null
    }
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}`;

    await fileGenerator.generateFile(path.join(appPath, 'src/main.tsx'), mainTsx);

    // 生成 App.tsx
    const appTsx = `import React from 'react'${config.useRouter ? `
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'` : `
import HelloWorld from './components/HelloWorld'`}
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>${config.name}</h1>
        <p>这是一个 React 微前端子应用</p>
      </header>
      
      ${config.useRouter ? `<nav className="app-nav">
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

    await fileGenerator.generateFile(path.join(appPath, 'src/App.tsx'), appTsx);

    // 生成 App.css
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

    await fileGenerator.generateFile(path.join(appPath, 'src/App.css'), appCss);

    // 生成组件
    if (!config.useRouter) {
      const helloWorld = `import React from 'react'

const HelloWorld: React.FC = () => {
  return (
    <div className="hello-world">
      <h2>欢迎使用 ${config.name}</h2>
      <p>这是一个基于 React + TypeScript + Vite 的微前端子应用</p>
      
      <div className="features">
        <h3>特性</h3>
        <ul>
          <li>✅ React 18</li>
          <li>✅ TypeScript 支持</li>
          <li>✅ Vite 构建工具</li>
          <li>✅ qiankun 微前端集成</li>${config.useStateManagement ? `
          <li>✅ Zustand 状态管理</li>` : ''}
        </ul>
      </div>
    </div>
  )
}

export default HelloWorld`;

      await fileGenerator.generateFile(path.join(appPath, 'src/components/HelloWorld.tsx'), helloWorld);
    }

    // 生成页面文件（如果使用路由）
    if (config.useRouter) {
      const homePage = `import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="home">
      <h2>首页</h2>
      <p>欢迎来到 ${config.name} 首页</p>
    </div>
  )
}

export default Home`;

      await fileGenerator.generateFile(path.join(appPath, 'src/pages/Home.tsx'), homePage);

      const aboutPage = `import React from 'react'

const About: React.FC = () => {
  return (
    <div className="about">
      <h2>关于我们</h2>
      <p>这是 ${config.name} 的关于页面</p>
    </div>
  )
}

export default About`;

      await fileGenerator.generateFile(path.join(appPath, 'src/pages/About.tsx'), aboutPage);
    }

    // 生成全局样式
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

    await fileGenerator.generateFile(path.join(appPath, 'src/index.css'), indexCss);

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
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

    await fileGenerator.generateFile(path.join(appPath, 'index.html'), indexHtml);
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
    // React 特定的配置验证
    return config.framework === 'react' && !!config.name && !!config.port;
  }
};
