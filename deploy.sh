#!/bin/bash
# ================================================
# 益寿巴渝 - 完整部署脚本（包括 gateway）
# 在服务器 /opt/YSBY-app/mobile 目录下执行
# ================================================

set -e

DEPLOY_DIR="/opt/YSBY-app"
MOBILE_DIR="$DEPLOY_DIR/mobile"
FRONTEND_DIR="$DEPLOY_DIR/frontend"

echo "=========================================="
echo "   益寿巴渝 - 开始完整部署"
echo "=========================================="
echo ""

# 0. 检查 Node.js 环境
echo "[检查] Node.js 版本:"
node --version
echo "[检查] pnpm 版本:"
pnpm --version
echo ""

# Step 1: 进入项目目录，拉取最新代码
echo "[1/8] 拉取最新代码..."
cd $MOBILE_DIR
git fetch origin
git reset --hard origin/main
echo "   ✓ 代码已更新到最新版本"
echo ""

# Step 2: 安装依赖
echo "[2/8] 安装依赖..."
pnpm install
echo "   ✓ 依赖安装完成"
echo ""

# Step 3: 构建前端
echo "[3/8] 构建前端..."
cd apps/mobile
pnpm build
echo "   ✓ 前端构建完成"
echo ""

# Step 4: 部署静态文件到 nginx 目录
echo "[4/8] 部署前端静态文件..."
mkdir -p $FRONTEND_DIR/dist
rm -rf $FRONTEND_DIR/dist/*
cp -r apps/mobile/dist/* $FRONTEND_DIR/dist/
echo "   ✓ 前端已部署到 $FRONTEND_DIR/dist/"
echo ""

# Step 5: 构建 user-service
echo "[5/8] 构建 user-service..."
cd $MOBILE_DIR/services/user-service
pnpm build
echo "   ✓ user-service 构建完成"
echo ""

# Step 6: 构建 gateway
echo "[6/8] 构建 gateway..."
cd $MOBILE_DIR/services/gateway
pnpm build
echo "   ✓ gateway 构建完成"
echo ""

# Step 7: 重启 user-service
echo "[7/8] 重启 user-service..."
cd $MOBILE_DIR/services/user-service
pm2 restart user-service 2>/dev/null || pm2 start dist/index.js --name user-service
echo "   ✓ user-service 已启动"
echo ""

# Step 8: 启动/重启 gateway
echo "[8/8] 启动/重启 gateway..."
cd $MOBILE_DIR/services/gateway
pm2 restart gateway 2>/dev/null || pm2 start dist/index.js --name gateway
echo "   ✓ gateway 已启动"
echo ""

# 显示 PM2 状态
echo "----------------------------------------"
echo "当前服务状态:"
pm2 list
echo ""
echo "----------------------------------------"
echo "服务端口:"
echo "  - gateway: 4000 (统一入口)"
echo "  - user-service: 4001"
echo "----------------------------------------"
echo ""
echo "=========================================="
echo "   部署完成！"
echo "   访问地址: http://8.137.174.210/"
echo "   API 地址: http://8.137.174.210/api/"
echo "=========================================="
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs"
echo "  重启 gateway: pm2 restart gateway"
echo "  重启 user-service: pm2 restart user-service"
echo ""
