#!/bin/bash
# ================================================
# 益寿巴渝 - 一键部署脚本
# 在服务器 /opt/YSBY-app/mobile 目录下执行
# ================================================

set -e

DEPLOY_DIR="/opt/YSBY-app"
MOBILE_DIR="$DEPLOY_DIR/mobile"
FRONTEND_DIR="$DEPLOY_DIR/frontend"

echo "=========================================="
echo "   益寿巴渝 - 开始自动部署"
echo "=========================================="
echo ""

# 0. 检查 Node.js 环境
echo "[检查] Node.js 版本:"
node --version
echo "[检查] pnpm 版本:"
pnpm --version
echo ""

# Step 1: 进入项目目录，拉取最新代码
echo "[1/6] 拉取最新代码..."
cd $MOBILE_DIR
git fetch origin
git reset --hard origin/main
echo "   ✓ 代码已更新到最新版本"
echo ""

# Step 2: 安装依赖
echo "[2/6] 安装依赖..."
pnpm install
echo "   ✓ 依赖安装完成"
echo ""

# Step 3: 构建前端
echo "[3/6] 构建前端..."
cd apps/mobile
pnpm build
echo "   ✓ 前端构建完成"
echo ""

# Step 4: 部署静态文件到 nginx 目录
echo "[4/6] 部署前端静态文件..."
mkdir -p $FRONTEND_DIR/dist
rm -rf $FRONTEND_DIR/dist/*
cp -r apps/mobile/dist/* $FRONTEND_DIR/dist/
echo "   ✓ 前端已部署到 $FRONTEND_DIR/dist/"
echo ""

# Step 5: 构建后端
echo "[5/6] 构建后端服务..."
cd $MOBILE_DIR/services/user-service
pnpm build
echo "   ✓ 后端构建完成"
echo ""

# Step 6: 重启后端服务
echo "[6/6] 重启后端服务..."
pm2 restart user-service 2>/dev/null || pm2 start dist/index.js --name user-service
echo "   ✓ 后端服务已重启"
echo ""

# 显示 PM2 状态
echo "----------------------------------------"
echo "当前服务状态:"
pm2 list
echo ""
echo "=========================================="
echo "   部署完成！访问地址: http://8.137.174.210/"
echo "=========================================="