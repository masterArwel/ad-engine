# CLI 工具使用指南

## 📋 概述

微前端 CLI 工具是一个交互式命令行工具，用于快速创建和管理微前端子应用。通过问答形式的界面，你可以轻松选择技术栈、配置选项，并自动生成完整的子应用项目。

## 🚀 快速开始

### 启动 CLI 工具

```bash
# 方式 1: 使用 npm 脚本（推荐）
npm run create-app

# 方式 2: 直接运行
node cli/index.cjs create
```

### 交互式创建流程

CLI 工具会引导你完成以下配置：

#### 1. 基本信息
- **应用名称**: 输入子应用的名称（只能包含小写字母、数字和连字符）
- **技术栈选择**: 选择 Vue 3、React 或 Angular
- **端口配置**: 设置开发服务器端口（自动分配或手动指定）

#### 2. 功能配置
- **路由管理**: 是否集成路由功能
- **状态管理**: 是否使用状态管理（Vue: Pinia, React: Zustand）
- **CSS 预处理器**: 选择 CSS、Sass、Less 或 Stylus
- **代码质量**: 配置 ESLint 和 Prettier

#### 3. 集成选项
- **自动注册**: 是否自动注册到基座应用

## 🎯 功能特性

### ✨ 支持的技术栈

| 框架 | 版本 | 特性 |
|------|------|------|
| **Vue 3** | 3.4+ | Composition API, TypeScript, Vite |
| **React** | 18.2+ | Hooks, TypeScript, Vite |
| **Angular** | 17+ | 开发中... |

### 🛠️ 自动配置功能

- ✅ **qiankun 集成** - 自动配置微前端生命周期
- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **Vite 构建** - 现代化构建工具配置
- ✅ **路由配置** - 自动配置路由和导航
- ✅ **状态管理** - 集成主流状态管理方案
- ✅ **代码规范** - ESLint 和 Prettier 配置
- ✅ **自动注册** - 自动更新基座应用配置

## 📝 使用示例

### 示例 1: 创建 Vue 应用

```bash
$ npm run create-app

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

📦 开始创建 VUE 应用: my-vue-app
✅ 项目结构创建完成
✅ 依赖安装完成
✅ 注册到基座应用完成

🎉 应用创建成功！
```

### 示例 2: 创建 React 应用

```bash
$ npm run create-app

🚀 欢迎使用微前端子应用创建工具

? 请输入应用名称: my-react-app
? 选择技术栈: 🔵 React + TypeScript + Vite
? 请输入开发服务器端口: 3002
? 是否使用路由? Yes
? 是否使用状态管理? Yes
? 选择 CSS 预处理器: CSS
? 是否使用 ESLint? Yes
? 是否使用 Prettier? Yes
? 是否自动注册到基座应用? Yes

📦 开始创建 REACT 应用: my-react-app
✅ 项目结构创建完成
✅ 依赖安装完成
✅ 注册到基座应用完成

🎉 应用创建成功！
```

## 📁 生成的项目结构

### Vue 应用结构

```
my-vue-app/
├── src/
│   ├── components/          # 组件目录
│   │   └── HelloWorld.vue
│   ├── views/              # 视图目录（如果启用路由）
│   │   ├── Home.vue
│   │   └── About.vue
│   ├── router/             # 路由配置（如果启用）
│   │   └── index.ts
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口文件
│   └── env.d.ts            # 类型定义
├── public/                 # 静态资源
├── package.json            # 依赖配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── index.html              # HTML 模板
```

### React 应用结构

```
my-react-app/
├── src/
│   ├── components/         # 组件目录
│   │   └── HelloWorld.tsx
│   ├── pages/              # 页面目录（如果启用路由）
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── App.tsx             # 根组件
│   ├── App.css             # 应用样式
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── public/                 # 静态资源
├── package.json            # 依赖配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── index.html              # HTML 模板
```

## 🔧 自动配置详情

### qiankun 集成

CLI 工具会自动配置 qiankun 微前端集成：

```typescript
// 自动生成的 main.ts/tsx
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

renderWithQiankun({
  mount(props) {
    console.log('app mount', props)
    render(props)
  },
  bootstrap() {
    console.log('app bootstrap')
  },
  unmount() {
    console.log('app unmount')
    // 清理逻辑
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render() // 独立运行
}
```

### Vite 配置

```typescript
// 自动生成的 vite.config.ts
import { defineConfig } from 'vite'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    // 框架插件 (vue/react)
    qiankun('app-name', { useDevMode: true })
  ],
  server: {
    port: 3001,
    cors: true,
    origin: 'http://localhost:3001'
  },
  build: {
    target: 'esnext',
    lib: {
      name: 'app-name',
      entry: './src/main.ts',
      formats: ['umd']
    }
  }
})
```

### 基座应用自动更新

如果选择自动注册，CLI 工具会自动更新以下文件：

#### 1. 微应用配置 (`src/config/microApps.ts`)

```typescript
export const devMicroApps: MicroApp[] = [
  // 现有应用...
  {
    name: 'my-vue-app',
    entry: 'http://localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/my-vue-app',
    props: {
      routerBase: '/my-vue-app',
    },
  },
];
```

#### 2. 路由配置 (`src/router/index.tsx`)

```typescript
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 现有路由...
      {
        path: 'my-vue-app/*',
        element: <MicroAppContainer />,
      },
    ],
  },
]);
```

#### 3. 导航菜单 (`src/components/Layout.tsx`)

```typescript
<nav className="header-nav">
  {/* 现有导航... */}
  <Link 
    to="/my-vue-app" 
    className={location.pathname.startsWith('/my-vue-app') ? 'active' : ''}
  >
    my-vue-app
  </Link>
</nav>
```

## 🎛️ 高级配置

### 自定义模板

你可以通过修改 `cli/index.js` 来自定义应用模板：

```javascript
// 在 createVueApp 或 createReactApp 函数中
// 修改生成的文件内容和结构
```

### 添加新的技术栈

要添加新的框架支持：

1. 在 `promptQuestions` 函数中添加新选项
2. 创建对应的 `createXxxApp` 函数
3. 在 `createApplication` 中添加处理逻辑

### 自定义配置选项

可以在问答流程中添加更多配置选项：

```javascript
{
  type: 'confirm',
  name: 'useTestFramework',
  message: '是否添加测试框架?',
  default: false
}
```

## 🚀 启动和管理

### 启动创建的应用

```bash
# 启动单个应用
cd sub-apps/my-vue-app
npm run dev

# 启动所有应用
npm run start:all

# 停止所有应用
npm run stop:all
```

### 访问应用

- **独立访问**: `http://localhost:3001`
- **基座访问**: `http://localhost:3000/my-vue-app`

## 🔍 故障排除

### 常见问题

#### 1. 端口被占用

```bash
Error: 端口 3001 已被占用
```

**解决方案**: 
- 选择其他端口
- 停止占用端口的进程: `lsof -ti:3001 | xargs kill`

#### 2. 应用名称冲突

```bash
Error: 应用 "my-app" 已存在
```

**解决方案**: 
- 选择不同的应用名称
- 删除现有应用: `rm -rf sub-apps/my-app`

#### 3. 依赖安装失败

```bash
Error: npm install failed
```

**解决方案**: 
- 检查网络连接
- 清除 npm 缓存: `npm cache clean --force`
- 使用国内镜像: `npm config set registry https://registry.npmmirror.com`

#### 4. 自动注册失败

**解决方案**: 
- 手动更新基座应用配置文件
- 检查文件权限
- 确保基座应用文件结构正确

### 调试模式

如果遇到问题，可以查看详细日志：

```bash
# 在 CLI 工具中添加 --verbose 标志（需要修改代码）
DEBUG=* npm run create-app
```

## 📚 相关文档

- [微前端子应用集成方案](./微前端子应用集成方案.md)
- [快速开始指南](./快速开始指南.md)
- [qiankun 官方文档](https://qiankun.umijs.org/)

## 🤝 贡献指南

欢迎贡献代码和建议：

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 更新日志

### v1.0.0
- ✅ 支持 Vue 3 和 React 应用创建
- ✅ 交互式配置界面
- ✅ 自动 qiankun 集成
- ✅ 自动基座应用注册
- ✅ TypeScript 支持
- ✅ 多种 CSS 预处理器支持

### 计划功能
- 🔄 Angular 应用支持
- 🔄 自定义模板系统
- 🔄 应用更新和删除功能
- 🔄 批量操作支持

---

**CLI 工具使用指南** | 让微前端开发更简单 🚀
