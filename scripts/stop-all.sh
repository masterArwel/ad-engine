#!/bin/bash

# 停止所有微前端应用的脚本
# 使用方法: ./scripts/stop-all.sh

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

print_message "🛑 停止微前端开发环境..."

# 停止应用函数
stop_app() {
    local pid_file=$1
    local app_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        
        if ps -p $pid > /dev/null 2>&1; then
            print_step "停止 $app_name (PID: $pid)..."
            kill $pid
            
            # 等待进程结束
            local count=0
            while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
                sleep 1
                ((count++))
            done
            
            # 如果进程仍在运行，强制杀死
            if ps -p $pid > /dev/null 2>&1; then
                print_warning "强制停止 $app_name..."
                kill -9 $pid
            fi
            
            print_message "✅ $app_name 已停止"
        else
            print_warning "$app_name 进程不存在 (PID: $pid)"
        fi
        
        # 删除 PID 文件
        rm -f "$pid_file"
    else
        print_warning "$app_name PID 文件不存在: $pid_file"
    fi
}

# 检查日志目录
if [ ! -d "logs" ]; then
    print_warning "日志目录不存在，可能没有运行的应用"
    exit 0
fi

# 停止基座应用
if [ -f "logs/main-app.pid" ]; then
    stop_app "logs/main-app.pid" "基座应用"
fi

# 停止所有子应用
for pid_file in logs/*.pid; do
    if [ -f "$pid_file" ] && [ "$pid_file" != "logs/main-app.pid" ]; then
        app_name=$(basename "$pid_file" .pid)
        stop_app "$pid_file" "$app_name"
    fi
done

# 额外检查：通过端口杀死可能遗漏的进程
print_step "检查端口占用情况..."

kill_by_port() {
    local port=$1
    local app_name=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null || echo "")
    if [ -n "$pid" ]; then
        print_warning "发现 $app_name 仍在运行 (端口: $port, PID: $pid)，强制停止..."
        kill -9 $pid 2>/dev/null || true
        print_message "✅ 强制停止 $app_name"
    fi
}

# 检查常用端口
kill_by_port 3000 "基座应用"
kill_by_port 3001 "子应用"
kill_by_port 3002 "子应用"
kill_by_port 3003 "子应用"
kill_by_port 3004 "子应用"
kill_by_port 3005 "子应用"

# 清理日志文件（可选）
read -p "是否清理日志文件？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "清理日志文件..."
    rm -f logs/*.log
    print_message "✅ 日志文件已清理"
fi

print_message ""
print_message "🎉 所有应用已停止！"
print_message ""
print_message "💡 提示:"
print_message "   重新启动: ./scripts/start-all.sh"
print_message "   创建子应用: ./scripts/create-subapp.sh <name> <vue|react>"
