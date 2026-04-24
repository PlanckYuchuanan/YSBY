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
GATEWAY_DIR="$YSBY_DIR/services/gateway"
USER_SERVICE_DIR="$YSBY_DIR/services/user-service"

# 1. 进入项目目录，拉取最新代码
echo "[1/6] 拉取最新代码..."
cd $YSBY_DIR
git fetch origin
git pull origin main
echo "   ✓ 代码已更新到最新版本"

# 2. 安装依赖（使用 pnpm）
echo "[2/6] 安装依赖..."
cd $YSBY_DIR
pnpm install
echo "   ✓ 依赖安装完成"

# 3. 构建 user-service
echo "[3/6] 构建 user-service..."
cd $USER_SERVICE_DIR
npx tsc
echo "   ✓ user-service 构建完成"

# 4. 构建 gateway
echo "[4/6] 构建 gateway..."
cd $GATEWAY_DIR
npx tsc
echo "   ✓ gateway 构建完成"

# 5. 构建前端
echo "[5/6] 构建前端..."
cd $YSBY_DIR/apps/mobile
pnpm build
echo "   ✓ 前端构建完成"

# 6. 重启服务
echo "[6/6] 重启服务..."
cd $YSBY_DIR
pm2 restart user-service 2>/dev/null || (cd $USER_SERVICE_DIR && pm2 start dist/index.js --name user-service)
pm2 restart gateway 2>/dev/null || (cd $GATEWAY_DIR && pm2 start dist/index.js --name gateway)
pm2 save
echo "   ✓ 服务已启动"

echo ""
echo "========== YSBY 项目部署完成 =========="
echo "访问地址: http://8.137.174.210/"
echo ""
echo "服务状态:"
pm2 list
