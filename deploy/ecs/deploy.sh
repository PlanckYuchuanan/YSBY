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
echo "[1/7] 拉取最新代码..."
cd $YSBY_DIR
git fetch origin
git pull origin main
echo "   ✓ 代码已更新到最新版本"

# 2. 安装根目录依赖
echo "[2/7] 安装根目录依赖..."
cd $YSBY_DIR
npm install
echo "   ✓ 根目录依赖安装完成"

# 3. 安装并构建 user-service
echo "[3/7] 构建 user-service..."
cd $USER_SERVICE_DIR
npm install
npx tsc
echo "   ✓ user-service 构建完成"

# 4. 安装并构建 gateway
echo "[4/7] 构建 gateway..."
cd $GATEWAY_DIR
npm install
npx tsc
echo "   ✓ gateway 构建完成"

# 5. 安装并构建前端
echo "[5/7] 构建前端..."
cd $YSBY_DIR/apps/mobile
npm install
npm run build
echo "   ✓ 前端构建完成"

# 6. 重启后端服务
echo "[6/7] 重启后端服务..."
cd $YSBY_DIR
npx pm2 restart user-service 2>/dev/null || (cd $USER_SERVICE_DIR && npx pm2 start dist/index.js --name user-service)
npx pm2 restart gateway 2>/dev/null || (cd $GATEWAY_DIR && npx pm2 start dist/index.js --name gateway)
npx pm2 save
echo "   ✓ 后端服务已启动"

# 7. 验证部署
echo "[7/7] 验证部署..."
echo ""
echo "检查 user-service 状态..."
curl -s http://127.0.0.1:4001/health 2>/dev/null && echo " ✓ user-service 正常" || echo " ✗ user-service 未响应"
echo ""
echo "检查 gateway 状态..."
curl -s http://127.0.0.1:4000/health 2>/dev/null && echo " ✓ gateway 正常" || echo " ✗ gateway 未响应"

echo ""
echo "========== YSBY 项目部署完成 =========="
echo "访问地址: http://8.137.174.210/"
echo ""
echo "服务状态:"
npx pm2 list
echo ""
echo "常用命令:"
echo "  查看 user-service 日志: npx pm2 logs user-service"
echo "  查看 gateway 日志: npx pm2 logs gateway"
echo "  重启所有服务: npx pm2 restart all"
