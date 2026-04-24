#!/bin/bash
# ============================================
# YSBY 项目部署脚本
# 执行方式: bash deploy.sh
# ============================================

set -e

echo "========== YSBY 项目部署开始 =========="
echo "时间: $(date)"

# 配置变量
YSBY_DIR="/opt/ysby"
FRONTEND_DIR="$YSBY_DIR/frontend"
BACKEND_DIR="$YSBY_DIR/user-service"
LOG_DIR="/var/log/ysby"

# 1. 创建必要的目录
echo "[1/7] 创建目录..."
mkdir -p $YSBY_DIR
mkdir -p $FRONTEND_DIR
mkdir -p $BACKEND_DIR
mkdir -p $LOG_DIR

# 2. 初始化数据库
echo "[2/7] 初始化数据库..."
echo "请确保已执行以下命令创建数据库："
echo "  mysql -u root -p < /opt/ysby/init_db.sql"
read -p "数据库已初始化? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "请先初始化数据库后再继续"
    exit 1
fi

# 3. 构建后端
echo "[3/7] 构建后端..."
cd $BACKEND_DIR
if [ ! -f "package.json" ]; then
    echo "错误: 后端目录为空，请先上传代码"
    exit 1
fi
npm install --production
npm run build
echo "后端构建完成"

# 4. 构建前端
echo "[4/7] 构建前端..."
cd $YSBY_DIR/apps/mobile
if [ ! -f "package.json" ]; then
    echo "错误: 前端目录为空，请先上传代码"
    exit 1
fi
npm install
# 修改 API 地址为相对路径
sed -i "s|http://localhost:4001|/ysby/api|g" src/App.tsx
sed -i "s|http://192.168.2.28:4001|/ysby/api|g" src/App.tsx 2>/dev/null || true
npm run build
echo "前端构建完成"

# 5. 配置 Nginx
echo "[5/7] 配置 Nginx..."
cp /opt/ysby/deploy/nginx-ysby.conf /etc/nginx/sites-available/ysby
ln -sf /etc/nginx/sites-available/ysby /etc/nginx/sites-enabled/ysby
nginx -t && systemctl reload nginx
echo "Nginx 配置完成"

# 6. 配置 systemd 服务
echo "[6/7] 配置 systemd 服务..."
cp /opt/ysby/deploy/ysby-user.service /etc/systemd/system/ysby-user.service
systemctl daemon-reload
systemctl enable ysby-user
systemctl restart ysby-user
systemctl status ysby-user --no-pager

# 7. 验证部署
echo "[7/7] 验证部署..."
sleep 2
echo "检查 user-service 状态..."
curl -s http://127.0.0.1:4001/areas?level=1 | head -c 200
echo ""
echo ""
echo "检查 Nginx 状态..."
curl -s -I http://127.0.0.1/ysby/ | head -5

echo ""
echo "========== YSBY 项目部署完成 =========="
echo "访问地址: http://8.137.174.210/ysby/"
echo "API 地址: http://8.137.174.210/ysby/api/"
echo ""
echo "常用命令:"
echo "  查看后端日志: journalctl -u ysby-user -f"
echo "  重启后端: systemctl restart ysby-user"
echo "  查看后端状态: systemctl status ysby-user"
