# @micro-frontend/cli

一个强大的微前端应用创建工具，支持 Vue、React 等多种框架，提供交互式配置和插件化架构。

## 🚀 特性

- 🎨 **交互式界面** - 问答形式的配置收集
- 🔧 **多框架支持** - Vue 3、React 18（Angular 规划中）
- 🔌 **插件化架构** - 可扩展的框架插件系统
- ⚙️ **智能配置** - 自动配置路由、状态管理、构建工具
- 🎯 **qiankun 集成** - 自动配置微前端生命周期
- 📦 **完整项目** - 生成完整的项目结构和配置
- 🔗 **自动注册** - 自动更新基座应用配置

## 📦 安装

### 全局安装

```bash
npm install -g @micro-frontend/cli
```

### 项目内安装

```bash
npm install @micro-frontend/cli --save-dev
```

## 🎯 快速开始

### 命令行使用

```bash
# 创建新应用
micro-cli create

# 或使用短命令
mcli create

# 显示工具信息
micro-cli info

# 管理配置
micro-cli config --list
```

### 编程式使用

```typescript
import { createApp, MicroFrontendCLI } from '@micro-frontend/cli';

// 快速创建应用
await createApp();

// 或使用 CLI 实例
const cli = new MicroFrontendCLI();
await cli.createApp({
  skipInstall: false,
  verbose: true
});
```

## 🎨 交互式配置

CLI 工具会引导你完成以下配置：

```
🚀 欢迎使用微前端子应用创建工具

? 请输入应用名称: my-vue-app
? 选择技术栈: 🟢 Vue 3 + TypeScript + Vite
? 请输入开发服务器端口: 3001
? 是否使用路由? Yes
? 是否使用状态管理? Yes
? 选择 CSS 预处理器: Sass/SCSS
? 是否使用 ESLint? Yes
? 是否使用 Prettier? Yes
? 是否自动注册到基座应用? Yes
```

## 🏗️ 支持的框架

### Vue 3

- ✅ Vue 3 Composition API
- ✅ TypeScript 支持
- ✅ Vite 构建工具
- ✅ Vue Router 4（可选）
- ✅ Pinia 状态管理（可选）
- ✅ qiankun 微前端集成

### React 18

- ✅ React 18 Hooks
- ✅ TypeScript 支持
- ✅ Vite 构建工具
- ✅ React Router 6（可选）
- ✅ Zustand 状态管理（可选）
- ✅ qiankun 微前端集成

### Angular（规划中）

- 🔄 Angular 17+
- 🔄 TypeScript 支持
- 🔄 Angular CLI 集成
- 🔄 Single-spa 集成

## 🔌 插件系统

### 内置插件

- **VuePlugin** - Vue 3 应用创建
- **ReactPlugin** - React 18 应用创建

### 自定义插件

```typescript
import { FrameworkPlugin, MicroAppConfig } from '@micro-frontend/cli';

const MyPlugin: FrameworkPlugin = {
  name: 'my-plugin',
  framework: 'my-framework',
  
  async createApp(appPath: string, config: MicroAppConfig): Promise<void> {
    // 实现应用创建逻辑
  },
  
  getDefaultConfig(): Partial<MicroAppConfig> {
    return {
      useRouter: true,
      cssPreprocessor: 'scss'
    };
  },
  
  validateConfig(config: MicroAppConfig): boolean {
    return config.framework === 'my-framework';
  }
};

// 注册插件
const cli = new MicroFrontendCLI();
cli.pluginManager.register(MyPlugin);
```

## ⚙️ 配置系统

### 全局配置

配置文件位置：`~/.micro-cli/config.json`

```json
{
  "defaultOutputDir": "sub-apps",
  "defaultPortStart": 3001,
  "supportedFrameworks": ["vue", "react"],
  "mainAppConfig": {
    "microAppsConfigPath": "src/config/microApps.ts",
    "routerConfigPath": "src/router/index.tsx",
    "layoutComponentPath": "src/components/Layout.tsx"
  }
}
```

### 项目配置

项目根目录：`.micro-cli.json`

```json
{
  "defaultOutputDir": "apps",
  "defaultPortStart": 4000
}
```

### 编程式配置

```typescript
import { MicroFrontendCLI } from '@micro-frontend/cli';

const cli = new MicroFrontendCLI({
  defaultOutputDir: 'micro-apps',
  defaultPortStart: 5000,
  mainAppConfig: {
    microAppsConfigPath: 'src/config/apps.ts',
    routerConfigPath: 'src/routes.tsx',
    layoutComponentPath: 'src/Layout.tsx'
  }
});
```

## 📁 生成的项目结构

### Vue 应用

```
my-vue-app/
├── src/
│   ├── components/
│   │   └── HelloWorld.vue
│   ├── views/              # 如果启用路由
│   │   ├── Home.vue
│   │   └── About.vue
│   ├── router/             # 如果启用路由
│   │   └── index.ts
│   ├── App.vue
│   ├── main.ts
│   └── env.d.ts
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

### React 应用

```
my-react-app/
├── src/
│   ├── components/
│   │   └── HelloWorld.tsx
│   ├── pages/              # 如果启用路由
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## 🔧 API 参考

### MicroFrontendCLI

```typescript
class MicroFrontendCLI {
  constructor(config?: Partial<CLIConfig>)
  
  // 创建应用
  async createApp(options?: Partial<CreateAppOptions>): Promise<void>
  
  // 获取信息
  getInfo(): { version: string; plugins: any[]; config: CLIConfig }
  
  // 更新配置
  async updateConfig(newConfig: Partial<CLIConfig>): Promise<void>
}
```

### 类型定义

```typescript
interface MicroAppConfig {
  name: string;
  framework: 'vue' | 'react' | 'angular';
  port: number;
  useRouter: boolean;
  useStateManagement: boolean;
  cssPreprocessor: 'css' | 'scss' | 'less' | 'stylus';
  useEslint: boolean;
  usePrettier: boolean;
  addToMainApp: boolean;
  outputDir?: string;
  customConfig?: Record<string, any>;
}

interface CreateAppOptions {
  config: MicroAppConfig;
  skipInstall?: boolean;
  verbose?: boolean;
  template?: string;
}
```

## 🛠️ 开发

### 克隆项目

```bash
git clone https://github.com/your-username/micro-frontend-cli.git
cd micro-frontend-cli
```

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

### 运行测试

```bash
npm test
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发指南

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 添加单元测试
- 更新文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [qiankun](https://qiankun.umijs.org/) - 微前端框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Vue](https://vuejs.org/) - 渐进式框架
- [React](https://reactjs.org/) - UI 库
- [inquirer](https://github.com/SBoudrias/Inquirer.js/) - 交互式命令行
- [chalk](https://github.com/chalk/chalk) - 终端颜色
- [ora](https://github.com/sindresorhus/ora) - 加载动画

## 📈 更新日志

### v1.0.0

- ✅ 初始版本发布
- ✅ Vue 3 和 React 18 支持
- ✅ 交互式配置界面
- ✅ 插件化架构
- ✅ qiankun 微前端集成
- ✅ 自动基座应用注册

## 🔗 相关链接

- [文档网站](https://your-docs-site.com)
- [GitHub 仓库](https://github.com/your-username/micro-frontend-cli)
- [问题反馈](https://github.com/your-username/micro-frontend-cli/issues)
- [更新日志](https://github.com/your-username/micro-frontend-cli/releases)

---

**@micro-frontend/cli** - 让微前端开发更简单 🚀
