# 微前端基座应用

基于 Vite + React + TypeScript + qiankun 构建的现代化微前端基座应用。

## 🚀 特性

- ⚡️ **Vite** - 极速的构建工具和开发服务器
- ⚛️ **React 18** - 最新的 React 版本，支持并发特性
- 🔷 **TypeScript** - 完整的类型支持
- 🏗️ **qiankun** - 成熟的微前端解决方案
- 🎨 **现代化 UI** - 响应式设计，支持暗色主题
- 🔄 **状态共享** - 基座与微应用间的状态通信
- 🛣️ **路由管理** - 统一的路由配置和管理
- 🎯 **样式隔离** - 完善的样式隔离机制
- 📡 **HTTP 请求** - 基于 axios 的完整请求封装，支持拦截器、错误处理、文件上传等

## 📦 技术栈

- **构建工具**: Vite 7.x
- **前端框架**: React 18.x
- **类型系统**: TypeScript 5.x
- **微前端**: qiankun 2.x
- **路由**: React Router 6.x
- **HTTP 客户端**: axios
- **样式**: CSS3 + CSS Variables

## 🛠️ 开发环境

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

基座应用将在 http://localhost:3000 启动。

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

### 预览生产版本

\`\`\`bash
npm run preview
\`\`\`

## 📁 项目结构

\`\`\`
ad-engine/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 通用组件
│   │   ├── Layout.tsx     # 主布局组件
│   │   └── MicroAppContainer.tsx  # 微应用容器
│   ├── config/            # 配置文件
│   │   ├── microApps.ts   # 微应用配置
│   │   └── qiankun.ts     # qiankun 配置
│   ├── pages/             # 页面组件
│   │   └── Home.tsx       # 首页
│   ├── router/            # 路由配置
│   │   └── index.tsx      # 路由定义
│   ├── utils/             # 工具函数
│   │   └── env.ts         # 环境变量工具
│   ├── main.tsx           # 应用入口
│   └── index.css          # 全局样式
├── package.json
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── README.md
\`\`\`

## 🔧 配置说明

### 微应用配置

在 \`src/config/microApps.ts\` 中配置微应用：

\`\`\`typescript
export const microApps: MicroApp[] = [
  {
    name: 'vue-app',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/vue-app',
    props: {
      routerBase: '/vue-app',
    },
  },
  // ... 更多微应用
];
\`\`\`

### qiankun 配置

在 \`src/config/qiankun.ts\` 中配置 qiankun：

\`\`\`typescript
// 启动 qiankun
start({
  sandbox: {
    strictStyleIsolation: false,
    experimentalStyleIsolation: true,
  },
  prefetch: 'all',
});
\`\`\`

### 路由配置

在 \`src/router/index.tsx\` 中配置路由：

\`\`\`typescript
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'home', element: <Home /> },
      { path: 'vue-app/*', element: <MicroAppContainer /> },
      // ... 更多路由
    ],
  },
]);
\`\`\`

## 🌐 微应用开发

### 创建微应用

1. 在项目根目录创建微应用目录：
\`\`\`bash
mkdir micro-apps
cd micro-apps
\`\`\`

2. 创建 Vue 微应用：
\`\`\`bash
npm create vue@latest vue-app
cd vue-app
npm install
\`\`\`

3. 配置微应用的 qiankun 生命周期（参考 qiankun 官方文档）

### 微应用接入

1. 在微应用中安装 qiankun 相关依赖
2. 导出 qiankun 生命周期函数
3. 在基座应用的 \`microApps.ts\` 中注册微应用
4. 启动微应用开发服务器

## 🔄 状态管理

基座应用提供了全局状态管理，支持与微应用的状态通信：

\`\`\`typescript
// 设置全局状态
setGlobalState({
  user: { id: '1', name: '用户' },
  theme: 'dark'
});

// 监听状态变化
onGlobalStateChange((state, prev) => {
  console.log('状态变化:', state, prev);
});
\`\`\`

## 📡 HTTP 请求

项目集成了基于 axios 的完整 HTTP 请求解决方案：

### 基本使用

\`\`\`typescript
import { authApi, userApi, commonApi } from '@/services';

// 用户登录
const loginResponse = await authApi.login({
  username: 'admin',
  password: '123456'
});

// 获取用户列表
const userListResponse = await userApi.getUserList({
  pageNum: 1,
  pageSize: 10
});

// 文件上传
const uploadResponse = await commonApi.uploadFile(file, (progress) => {
  console.log('上传进度:', progress + '%');
});
\`\`\`

### 自定义请求

\`\`\`typescript
import { request } from '@/services';

const response = await request({
  url: '/custom/api',
  method: 'POST',
  data: { key: 'value' },
  headers: { 'Custom-Header': 'value' }
});
\`\`\`

### 特性

- ✅ **自动认证** - 自动添加 Authorization 头
- ✅ **错误处理** - 统一的错误处理和提示
- ✅ **请求拦截** - 支持请求/响应拦截器
- ✅ **文件上传** - 支持文件上传和进度监控
- ✅ **文件下载** - 支持文件下载
- ✅ **取消请求** - 支持请求取消
- ✅ **TypeScript** - 完整的类型定义

### API 服务

- **authApi** - 认证相关（登录、登出、获取用户信息等）
- **userApi** - 用户管理（CRUD、权限管理等）
- **commonApi** - 通用服务（文件上传下载、字典数据等）

## 🎨 主题系统

应用支持亮色/暗色主题切换，使用 CSS Variables 实现：

\`\`\`css
.layout.light {
  --bg-primary: #ffffff;
  --text-primary: #333333;
}

.layout.dark {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
}
\`\`\`

## 📱 响应式设计

应用采用响应式设计，支持桌面端和移动端：

- 桌面端：完整的导航和布局
- 平板端：适配中等屏幕尺寸
- 移动端：折叠式导航，优化触摸体验

## 🚀 部署

### 构建应用

\`\`\`bash
npm run build
\`\`\`

### 部署到服务器

1. 将 \`dist\` 目录上传到服务器
2. 配置 Web 服务器（如 Nginx）
3. 确保微应用也已部署并可访问

### Nginx 配置示例

\`\`\`nginx
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist;
  index index.html;

  # 基座应用
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 微应用代理
  location /vue-app/ {
    proxy_pass http://vue-app-server/;
  }
}
\`\`\`

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [qiankun](https://qiankun.umijs.org/) - 微前端框架
- [Vite](https://vitejs.dev/) - 构建工具
- [React](https://reactjs.org/) - UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型系统