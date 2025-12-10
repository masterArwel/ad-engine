#!/bin/bash

# 微前端子应用创建脚本
# 使用方法: ./scripts/create-subapp.sh <app-name> <framework> <port>
# 示例: ./scripts/create-subapp.sh my-app vue 3001

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查参数
if [ $# -lt 2 ]; then
    print_error "参数不足！"
    echo "使用方法: $0 <app-name> <framework> [port]"
    echo "框架选项: vue | react"
    echo "示例: $0 my-app vue 3001"
    exit 1
fi

APP_NAME=$1
FRAMEWORK=$2
PORT=${3:-3001}

# 验证框架类型
if [[ "$FRAMEWORK" != "vue" && "$FRAMEWORK" != "react" ]]; then
    print_error "不支持的框架类型: $FRAMEWORK"
    echo "支持的框架: vue | react"
    exit 1
fi

# 检查端口是否被占用
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "端口 $PORT 已被占用，请选择其他端口"
    exit 1
fi

print_message "开始创建 $FRAMEWORK 子应用: $APP_NAME (端口: $PORT)"

# 创建子应用目录
SUB_APPS_DIR="sub-apps"
if [ ! -d "$SUB_APPS_DIR" ]; then
    mkdir -p "$SUB_APPS_DIR"
    print_message "创建子应用目录: $SUB_APPS_DIR"
fi

cd "$SUB_APPS_DIR"

# 检查应用是否已存在
if [ -d "$APP_NAME" ]; then
    print_error "应用 $APP_NAME 已存在！"
    exit 1
fi

# 创建应用
print_step "1/5 创建 $FRAMEWORK 项目..."

if [ "$FRAMEWORK" = "vue" ]; then
    # 创建 Vue 应用
    npm create vue@latest "$APP_NAME" -- --typescript --router --pinia --eslint
elif [ "$FRAMEWORK" = "react" ]; then
    # 创建 React 应用
    npm create vite@latest "$APP_NAME" -- --template react-ts
fi

cd "$APP_NAME"

# 安装依赖
print_step "2/5 安装依赖..."
npm install

# 安装 qiankun 插件
print_step "3/5 安装 qiankun 插件..."
npm install vite-plugin-qiankun

if [ "$FRAMEWORK" = "react" ]; then
    npm install react-router-dom
    npm install @types/react-router-dom -D
fi

# 配置 Vite
print_step "4/5 配置 Vite..."

cat > vite.config.ts << EOF
import { defineConfig } from 'vite'
$([ "$FRAMEWORK" = "vue" ] && echo "import vue from '@vitejs/plugin-vue'" || echo "import react from '@vitejs/plugin-react'")
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
$([ "$FRAMEWORK" = "vue" ] && echo "    vue()," || echo "    react(),")
    qiankun('$APP_NAME', { useDevMode: true })
  ],
  server: {
    port: $PORT,
    cors: true,
    origin: 'http://localhost:$PORT'
  },
  build: {
    target: 'esnext',
    lib: {
      name: '$APP_NAME',
      entry: './src/main.$([ "$FRAMEWORK" = "vue" ] && echo "ts" || echo "tsx")',
      formats: ['umd']
    }
  }
})
EOF

# 配置主入口文件
print_step "5/5 配置主入口文件..."

if [ "$FRAMEWORK" = "vue" ]; then
    # Vue 主入口文件
    cat > src/main.ts << 'EOF'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'

let app: any
let router: any

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./components/HelloWorld.vue')
  }
]

function render(props: any = {}) {
  const { container, routerBase } = props
  
  router = createRouter({
    history: createWebHistory(routerBase || '/APP_NAME_PLACEHOLDER/'),
    routes
  })
  
  app = createApp(App)
  app.use(createPinia())
  app.use(router)
  
  const containerEl = container ? container.querySelector('#app') : '#app'
  app.mount(containerEl)
}

renderWithQiankun({
  mount(props) {
    console.log('APP_NAME_PLACEHOLDER mount', props)
    render(props)
  },
  bootstrap() {
    console.log('APP_NAME_PLACEHOLDER bootstrap')
  },
  unmount() {
    console.log('APP_NAME_PLACEHOLDER unmount')
    app?.unmount()
    app = null
    router = null
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
EOF

    # 替换占位符
    sed -i '' "s/APP_NAME_PLACEHOLDER/$APP_NAME/g" src/main.ts

elif [ "$FRAMEWORK" = "react" ]; then
    # React 主入口文件
    cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import './index.css'

let root: ReactDOM.Root | null = null

const Home = () => (
  <div>
    <h1>APP_NAME_PLACEHOLDER 首页</h1>
    <p>这是一个 React 子应用</p>
  </div>
)

const About = () => (
  <div>
    <h1>关于页面</h1>
    <p>APP_NAME_PLACEHOLDER 应用的关于页面</p>
  </div>
)

const App = () => (
  <div style={{ padding: '20px' }}>
    <nav style={{ marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '10px' }}>首页</Link>
      <Link to="/about">关于</Link>
    </nav>
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  </div>
)

function render(props: any = {}) {
  const { container, routerBase } = props
  const containerEl = container ? container.querySelector('#root') : document.getElementById('root')
  
  if (!root) {
    root = ReactDOM.createRoot(containerEl!)
  }
  
  root.render(
    <React.StrictMode>
      <BrowserRouter basename={routerBase || '/APP_NAME_PLACEHOLDER'}>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

renderWithQiankun({
  mount(props) {
    console.log('APP_NAME_PLACEHOLDER mount', props)
    render(props)
  },
  bootstrap() {
    console.log('APP_NAME_PLACEHOLDER bootstrap')
  },
  unmount() {
    console.log('APP_NAME_PLACEHOLDER unmount')
    if (root) {
      root.unmount()
      root = null
    }
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
EOF

    # 替换占位符
    sed -i '' "s/APP_NAME_PLACEHOLDER/$APP_NAME/g" src/main.tsx
fi

# 返回项目根目录
cd ../..

print_message "✅ 子应用创建完成！"
print_message ""
print_message "📋 下一步操作："
print_message "1. 启动子应用:"
print_message "   cd sub-apps/$APP_NAME && npm run dev"
print_message ""
print_message "2. 在基座应用中注册子应用:"
print_message "   编辑 src/config/microApps.ts，添加以下配置:"
print_message ""
echo -e "${BLUE}   {
     name: '$APP_NAME',
     entry: 'http://localhost:$PORT',
     container: '#subapp-viewport',
     activeRule: '/$APP_NAME',
     props: {
       routerBase: '/$APP_NAME',
     },
   }${NC}"
print_message ""
print_message "3. 在基座路由中添加:"
print_message "   编辑 src/router/index.tsx，添加路由配置"
print_message ""
print_message "4. 访问测试:"
print_message "   独立访问: http://localhost:$PORT"
print_message "   基座访问: http://localhost:3000/$APP_NAME"
print_message ""
print_message "🎉 开始开发你的微前端应用吧！"
