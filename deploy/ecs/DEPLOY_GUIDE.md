# ============================================
# YSBY 项目部署到 ECS - 手动部署指南
# ============================================

## 部署流程（推荐）

```bash
# 1. 在本地开发环境提交代码并推送到 Git
git add .
git commit -m "your changes"
git push origin main

# 2. SSH 登录 ECS
ssh root@8.137.174.210

# 3. 进入项目目录，拉取最新代码并部署
cd /opt/YSBY-app
git pull origin main

# 4. 执行部署脚本（自动构建并重启服务）
bash deploy/ecs/deploy.sh
```

## 部署脚本说明

`deploy/ecs/deploy.sh` 会自动执行以下步骤：

1. 拉取最新代码 (`git pull`)
2. 安装依赖 (`pnpm install`)
3. 构建 user-service (`npx tsc`)
4. 构建 gateway (`npx tsc`)
5. 构建前端 (`pnpm build`) 并复制到 nginx 目录
6. 重启服务 (`pm2 restart`)

## 验证部署

```bash
# 测试后端服务
curl http://127.0.0.1:4000/health
curl http://127.0.0.1:4001/areas?level=1

# 测试前端
curl http://127.0.0.1/

# 浏览器访问
# http://8.137.174.210/
```

## 常用命令

```bash
# 查看服务状态
pm2 list

# 查看后端日志
pm2 logs user-service
pm2 logs gateway

# 重启服务
pm2 restart user-service
pm2 restart gateway

# 重载 Nginx
systemctl reload nginx

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 目录结构

```
/opt/YSBY-app/
├── apps/
│   └── mobile/           # 前端代码
│       └── dist/         # 构建产物 → /opt/YSBY-app/frontend/dist/
├── services/
│   ├── user-service/     # 用户服务 (端口 4001)
│   │   └── dist/         # 编译产物
│   └── gateway/          # API 网关 (端口 4000)
│       └── dist/         # 编译产物
├── deploy/
│   └── ecs/
│       ├── deploy.sh     # 部署脚本
│       ├── nginx-ysby.conf
│       └── init_db.sql   # 数据库初始化
└── frontend/             # nginx 静态文件目录
    └── dist/             # 前端构建产物
```

## 故障排查

### 后端无法启动
```bash
# 检查端口是否被占用
netstat -tlnp | grep -E '4000|4001'

# 检查 MySQL 连接
mysql -u root -p -e "SHOW DATABASES;"

# 查看错误日志
pm2 logs user-service --err
pm2 logs gateway --err
```

### Nginx 502 错误
```bash
# 检查后端是否运行
curl http://127.0.0.1:4000/health

# 检查 Nginx 配置
nginx -t

# 查看 Nginx 错误日志
tail -20 /var/log/nginx/error.log
```

### 前端静态文件问题
```bash
# 检查前端 dist 目录
ls -la /opt/YSBY-app/frontend/dist/

# 如果为空，重新复制
cp -r /opt/YSBY-app/apps/mobile/dist/* /opt/YSBY-app/frontend/dist/
```