#!/bin/bash
# ============================================
# YSBY 项目部署脚本
# 执行方式: bash deploy.sh
# ============================================

set -e

echo "========== YSBY 项目部署开始 =========="
echo "时间: $(date)"

# 配置变量
YSBY_DIR="/opt/YSBY-app"
FRONTEND_DIR="$YSBY_DIR/frontend"
GATEWAY_DIR="$YSBY_DIR/services/gateway"
USER_SERVICE_DIR="$YSBY_DIR/services/user-service"

# 1. 进入项目目录，拉取最新代码
echo "[1/6] 拉取最新代码..."
cd $YSBY_DIR
git fetch origin
git reset --hard origin/main
echo "   ✓ 代码已更新到最新版本"

# 2. 安装依赖
echo "[2/6] 安装依赖..."
pnpm install
echo "   ✓ 依赖安装完成"

# 3. 构建前端
echo "[3/6] 构建前端..."
cd $YSBY_DIR/apps/mobile
pnpm build
mkdir -p $FRONTEND_DIR/dist
rm -rf $FRONTEND_DIR/dist/*
cp -r dist/* $FRONTEND_DIR/dist/
echo "   ✓ 前端构建并部署完成"

# 4. 构建 user-service
echo "[4/6] 构建 user-service..."
cd $USER_SERVICE_DIR
pnpm build
echo "   ✓ user-service 构建完成"

# 5. 构建 gateway
echo "[5/6] 构建 gateway..."
cd $GATEWAY_DIR
pnpm build
echo "   ✓ gateway 构建完成"

# 6. 启动/重启服务
echo "[6/6] 启动/重启服务..."
# 重启 user-service
cd $USER_SERVICE_DIR
pm2 restart user-service 2>/dev/null || pm2 start dist/index.js --name user-service
# 重启 gateway
cd $GATEWAY_DIR
pm2 restart gateway 2>/dev/null || pm2 start dist/index.js --name gateway
pm2 save
echo "   ✓ 服务已启动"

# 验证部署
echo ""
echo "========== 验证部署 =========="
echo "检查 user-service 状态..."
curl -s http://127.0.0.1:4001/health 2>/dev/null || echo "user-service 未响应"
echo ""
echo "检查 gateway 状态..."
curl -s http://127.0.0.1:4000/health 2>/dev/null || echo "gateway 未响应"
echo ""
echo ""
echo "========== YSBY 项目部署完成 =========="
echo "访问地址: http://8.137.174.210/"
echo "API 地址: http://8.137.174.210/api/"
echo ""
echo "服务状态:"
pm2 list
echo ""
echo "常用命令:"
echo "  查看 user-service 日志: pm2 logs user-service"
echo "  查看 gateway 日志: pm2 logs gateway"
echo "  重启 user-service: pm2 restart user-service"
echo "  重启 gateway: pm2 restart gateway"
