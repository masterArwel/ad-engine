#!/bin/bash

# 启动所有微前端应用的脚本
# 使用方法: ./scripts/start-all.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查是否在项目根目录
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

print_message "🚀 启动微前端开发环境..."

# 检查端口占用情况
check_port() {
    local port=$1
    local app_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "$app_name 端口 $port 已被占用"
        return 1
    fi
    return 0
}

# 启动应用
start_app() {
    local app_path=$1
    local app_name=$2
    local port=$3
    
    if [ -d "$app_path" ]; then
        print_step "启动 $app_name (端口: $port)..."
        
        # 检查端口
        if ! check_port $port "$app_name"; then
            return 1
        fi
        
        # 启动应用
        cd "$app_path"
        
        # 检查是否有 node_modules
        if [ ! -d "node_modules" ]; then
            print_message "安装 $app_name 依赖..."
            npm install
        fi
        
        # 后台启动
        npm run dev > "../logs/${app_name}.log" 2>&1 &
        local pid=$!
        
        # 保存 PID
        echo $pid > "../logs/${app_name}.pid"
        
        print_message "✅ $app_name 已启动 (PID: $pid)"
        
        cd - > /dev/null
        return 0
    else
        print_warning "❌ $app_name 目录不存在: $app_path"
        return 1
    fi
}

# 创建日志目录
mkdir -p logs

# 清理旧的日志和 PID 文件
rm -f logs/*.log logs/*.pid

print_message "📋 检查应用状态..."

# 启动基座应用
print_step "启动基座应用 (端口: 3000)..."
if check_port 3000 "基座应用"; then
    npm run dev > logs/main-app.log 2>&1 &
    echo $! > logs/main-app.pid
    print_message "✅ 基座应用已启动 (PID: $(cat logs/main-app.pid))"
else
    print_error "基座应用启动失败，端口 3000 被占用"
    exit 1
fi

# 等待基座应用启动
sleep 3

# 检查并启动子应用
SUB_APPS_DIR="sub-apps"
if [ -d "$SUB_APPS_DIR" ]; then
    print_message "🔍 扫描子应用..."
    
    # 扫描子应用目录
    app_count=0
    port=3001
    
    for app_dir in "$SUB_APPS_DIR"/*; do
        if [ -d "$app_dir" ] && [ -f "$app_dir/package.json" ]; then
            app_name=$(basename "$app_dir")
            
            # 尝试从 vite.config.ts 中读取端口
            if [ -f "$app_dir/vite.config.ts" ]; then
                config_port=$(grep -o "port: [0-9]*" "$app_dir/vite.config.ts" | grep -o "[0-9]*" || echo "")
                if [ -n "$config_port" ]; then
                    port=$config_port
                fi
            fi
            
            if start_app "$app_dir" "$app_name" $port; then
                ((app_count++))
            fi
            
            ((port++))
        fi
    done
    
    if [ $app_count -eq 0 ]; then
        print_warning "未找到可启动的子应用"
    else
        print_message "✅ 成功启动 $app_count 个子应用"
    fi
else
    print_warning "子应用目录不存在: $SUB_APPS_DIR"
    print_message "💡 使用以下命令创建子应用:"
    print_message "   ./scripts/create-subapp.sh <app-name> <vue|react> [port]"
fi

# 等待所有应用启动完成
print_message "⏳ 等待应用启动完成..."
sleep 5

# 检查应用状态
print_message "📊 应用状态检查..."

check_app_status() {
    local port=$1
    local app_name=$2
    
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        print_message "✅ $app_name: http://localhost:$port (运行中)"
        return 0
    else
        print_warning "❌ $app_name: http://localhost:$port (未响应)"
        return 1
    fi
}

# 检查基座应用
check_app_status 3000 "基座应用"

# 检查子应用
if [ -d "$SUB_APPS_DIR" ]; then
    port=3001
    for app_dir in "$SUB_APPS_DIR"/*; do
        if [ -d "$app_dir" ] && [ -f "$app_dir/package.json" ]; then
            app_name=$(basename "$app_dir")
            
            # 从配置文件读取端口
            if [ -f "$app_dir/vite.config.ts" ]; then
                config_port=$(grep -o "port: [0-9]*" "$app_dir/vite.config.ts" | grep -o "[0-9]*" || echo "")
                if [ -n "$config_port" ]; then
                    port=$config_port
                fi
            fi
            
            check_app_status $port "$app_name"
            ((port++))
        fi
    done
fi

print_message ""
print_message "🎉 微前端开发环境启动完成！"
print_message ""
print_message "📱 访问地址:"
print_message "   基座应用: http://localhost:3000"

if [ -d "$SUB_APPS_DIR" ]; then
    port=3001
    for app_dir in "$SUB_APPS_DIR"/*; do
        if [ -d "$app_dir" ] && [ -f "$app_dir/package.json" ]; then
            app_name=$(basename "$app_dir")
            
            # 从配置文件读取端口
            if [ -f "$app_dir/vite.config.ts" ]; then
                config_port=$(grep -o "port: [0-9]*" "$app_dir/vite.config.ts" | grep -o "[0-9]*" || echo "")
                if [ -n "$config_port" ]; then
                    port=$config_port
                fi
            fi
            
            print_message "   $app_name: http://localhost:$port (独立访问)"
            print_message "   $app_name: http://localhost:3000/$app_name (基座访问)"
            ((port++))
        fi
    done
fi

print_message ""
print_message "📋 管理命令:"
print_message "   查看日志: tail -f logs/<app-name>.log"
print_message "   停止应用: ./scripts/stop-all.sh"
print_message "   重启应用: ./scripts/restart-all.sh"
print_message ""
print_message "💡 提示: 按 Ctrl+C 不会停止后台应用，请使用停止脚本"
