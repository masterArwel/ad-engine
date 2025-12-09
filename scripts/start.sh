#!/bin/bash

# 微前端基座应用启动脚本

echo "🚀 启动微前端基座应用..."

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "📦 当前 Node.js 版本: $NODE_VERSION"

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
  echo "📥 安装依赖..."
  npm install
fi

# 启动开发服务器
echo "🌟 启动开发服务器..."
npm run dev

