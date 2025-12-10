# CLI 工具演示

## 🎯 功能展示

### 启动 CLI 工具

```bash
npm run create-app
```

### 交互式创建流程演示

```
🚀 欢迎使用微前端子应用创建工具

? 请输入应用名称: demo-vue-app
? 选择技术栈: 🟢 Vue 3 + TypeScript + Vite
? 请输入开发服务器端口: 3001
? 是否使用路由? Yes
? 是否使用状态管理? Yes
? 选择 CSS 预处理器: Sass/SCSS
? 是否使用 ESLint? Yes
? 是否使用 Prettier? Yes
? 是否自动注册到基座应用? Yes

📦 开始创建 VUE 应用: demo-vue-app

✅ 项目结构创建完成
✅ 依赖安装完成
✅ 注册到基座应用完成

🎉 应用创建成功！

📋 应用信息:
   名称: demo-vue-app
   框架: VUE
   端口: 3001
   路径: sub-apps/demo-vue-app

🚀 下一步操作:
   1. 启动子应用:
      cd sub-apps/demo-vue-app && npm run dev
   2. 访问应用:
      独立访问: http://localhost:3001
      基座访问: http://localhost:3000/demo-vue-app
   3. 基座应用已自动更新配置

💡 管理命令:
   启动所有应用: npm run start:all
   停止所有应用: npm run stop:all
   创建新应用: npm run create-app

✨ 开始开发你的微前端应用吧！
```

## 🏗️ 生成的项目结构

### Vue 应用示例

```
sub-apps/demo-vue-app/
├── src/
│   ├── components/
│   │   └── HelloWorld.vue
│   ├── views/
│   │   ├── Home.vue
│   │   └── About.vue
│   ├── router/
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

### React 应用示例

```
sub-apps/demo-react-app/
├── src/
│   ├── components/
│   │   └── HelloWorld.tsx
│   ├── pages/
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

## ⚙️ 自动配置功能

### 1. qiankun 集成

CLI 工具会自动配置 qiankun 微前端集成：

```typescript
// 自动生成的 main.ts
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

renderWithQiankun({
  mount(props) {
    console.log('demo-vue-app mount', props)
    render(props)
  },
  bootstrap() {
    console.log('demo-vue-app bootstrap')
  },
  unmount() {
    console.log('demo-vue-app unmount')
    app?.unmount()
    app = null
    router = null
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render() // 独立运行
}
```

### 2. Vite 配置

```typescript
// 自动生成的 vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('demo-vue-app', { useDevMode: true })
  ],
  server: {
    port: 3001,
    cors: true,
    origin: 'http://localhost:3001'
  },
  build: {
    target: 'esnext',
    lib: {
      name: 'demo-vue-app',
      entry: './src/main.ts',
      formats: ['umd']
    }
  }
})
```

### 3. 基座应用自动更新

#### 微应用配置更新 (src/config/microApps.ts)

```typescript
export const devMicroApps: MicroApp[] = [
  // 现有应用...
  {
    name: 'demo-vue-app',
    entry: 'http://localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/demo-vue-app',
    props: {
      routerBase: '/demo-vue-app',
    },
  },
];
```

#### 路由配置更新 (src/router/index.tsx)

```typescript
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 现有路由...
      {
        path: 'demo-vue-app/*',
        element: <MicroAppContainer />,
      },
    ],
  },
]);
```

#### 导航菜单更新 (src/components/Layout.tsx)

```typescript
<nav className="header-nav">
  {/* 现有导航... */}
  <Link 
    to="/demo-vue-app" 
    className={location.pathname.startsWith('/demo-vue-app') ? 'active' : ''}
  >
    demo-vue-app
  </Link>
</nav>
```

## 🚀 启动和测试

### 1. 启动子应用

```bash
cd sub-apps/demo-vue-app
npm run dev
```

### 2. 启动基座应用

```bash
# 在项目根目录
npm run dev
```

### 3. 访问应用

- **独立访问**: http://localhost:3001
- **基座访问**: http://localhost:3000/demo-vue-app

### 4. 批量管理

```bash
# 启动所有应用
npm run start:all

# 停止所有应用
npm run stop:all
```

## 🎨 技术栈选择

### Vue 3 应用特性

- ✅ Vue 3 Composition API
- ✅ TypeScript 支持
- ✅ Vite 构建工具
- ✅ Vue Router 4 (可选)
- ✅ Pinia 状态管理 (可选)
- ✅ qiankun 微前端集成
- ✅ ESLint + Prettier (可选)

### React 应用特性

- ✅ React 18 Hooks
- ✅ TypeScript 支持
- ✅ Vite 构建工具
- ✅ React Router 6 (可选)
- ✅ Zustand 状态管理 (可选)
- ✅ qiankun 微前端集成
- ✅ ESLint + Prettier (可选)

## 🛠️ 自定义配置

### CSS 预处理器支持

- **CSS**: 原生 CSS
- **Sass/SCSS**: 自动配置 sass 依赖
- **Less**: 自动配置 less 依赖
- **Stylus**: 自动配置 stylus 依赖

### 代码质量工具

- **ESLint**: 代码检查和规范
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查

### 智能端口分配

CLI 工具会自动检测现有应用数量，智能分配端口：

- 第一个应用: 3001
- 第二个应用: 3002
- 第三个应用: 3003
- ...

## 📝 最佳实践

### 1. 应用命名规范

- 使用小写字母、数字和连字符
- 必须以字母开头
- 建议使用有意义的名称

```bash
✅ 正确: user-management, order-system, data-dashboard
❌ 错误: UserManagement, 123app, -invalid
```

### 2. 端口管理

- 基座应用: 3000
- 子应用: 3001, 3002, 3003...
- 避免端口冲突

### 3. 目录结构

```
project-root/
├── src/                    # 基座应用源码
├── sub-apps/              # 子应用目录
│   ├── app1/
│   ├── app2/
│   └── app3/
├── cli/                   # CLI 工具
├── scripts/               # 自动化脚本
└── docs/                  # 文档
```

### 4. 开发流程

1. 使用 CLI 工具创建子应用
2. 开发子应用功能
3. 在基座应用中测试集成
4. 部署到生产环境

## 🔍 故障排除

### 常见问题及解决方案

#### 1. 端口被占用

```bash
Error: 端口 3001 已被占用
```

**解决方案**: 
- 选择其他端口
- 停止占用端口的进程

#### 2. 应用名称冲突

```bash
Error: 应用 "my-app" 已存在
```

**解决方案**: 
- 选择不同的应用名称
- 删除现有应用

#### 3. 依赖安装失败

**解决方案**: 
- 检查网络连接
- 清除 npm 缓存
- 使用国内镜像

## 🎯 下一步计划

### 即将支持的功能

- 🔄 Angular 应用支持
- 🔄 自定义模板系统
- 🔄 应用更新和删除功能
- 🔄 批量操作支持
- 🔄 配置文件导入导出

---

**CLI 工具演示** | 体验微前端开发的便捷性 🚀
