# ============================================
# YSBY 项目部署到 ECS - 手动部署指南
# ============================================

## 第一步：上传代码到 ECS

```bash
# 在本地项目根目录打包
cd d:\MyWorkspace\Project\YSBY
tar -czvf ysby.tar.gz apps/ services/ deploy/

# 上传到 ECS
scp ysby.tar.gz root@8.137.174.210:/opt/

# SSH 登录 ECS
ssh root@8.137.174.210

# 解压到 /opt
cd /opt
tar -xzvf ysby.tar.gz
```

## 第二步：初始化数据库

```bash
# 登录 MySQL
mysql -u root -p

# 在 MySQL 中执行
source /opt/ysby/deploy/ecs/init_db.sql

# 或者直接执行
mysql -u root -p < /opt/ysby/deploy/ecs/init_db.sql
```

## 第三步：构建后端

```bash
cd /opt/ysby/services/user-service

# 安装依赖
npm install

# 构建 TypeScript
npm run build
```

## 第四步：构建前端

```bash
cd /opt/ysby/apps/mobile

# 安装依赖
npm install

# 修改 API 地址为相对路径
# 编辑 App.tsx，找到 API_BASE，改为:
# const API_BASE = '/ysby/api';

# 构建
npm run build
```

## 第五步：配置 Nginx

```bash
# 复制 Nginx 配置
cp /opt/ysby/deploy/ecs/nginx-ysby.conf /etc/nginx/sites-available/ysby

# 创建软链接
ln -sf /etc/nginx/sites-available/ysby /etc/nginx/sites-enabled/ysby

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

## 第六步：启动后端服务

方法一：使用 systemd（推荐）

```bash
# 复制服务文件
cp /opt/ysby/deploy/ecs/ysby-user.service /etc/systemd/system/

# 重载 systemd
systemctl daemon-reload

# 启用并启动服务
systemctl enable ysby-user
systemctl start ysby-user

# 查看状态
systemctl status ysby-user
```

方法二：直接运行

```bash
cd /opt/ysby/services/user-service
PORT=4001 MYSQL_HOST=127.0.0.1 MYSQL_PORT=3306 \
MYSQL_USER=root MYSQL_PASSWORD=247391 MYSQL_DATABASE=ysby \
npx tsx src/index.ts
```

## 第七步：验证部署

```bash
# 测试 API
curl http://127.0.0.1:4001/areas?level=1

# 测试前端
curl http://127.0.0.1/ysby/

# 浏览器访问
# http://8.137.174.210/ysby/
```

## 常用命令

```bash
# 查看后端日志
journalctl -u ysby-user -f

# 重启后端
systemctl restart ysby-user

# 重载 Nginx
systemctl reload nginx

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 目录结构

```
/opt/ysby/
├── apps/
│   └── mobile/           # 前端代码
│       └── dist/         # 构建产物
├── services/
│   └── user-service/     # 后端服务
│       └── dist/         # 编译产物
├── deploy/
│   └── ecs/
│       ├── init_db.sql   # 数据库初始化
│       ├── nginx-ysby.conf
│       └── ysby-user.service
```

## 故障排查

### 后端无法启动
```bash
# 检查端口是否被占用
netstat -tlnp | grep 4001

# 检查 MySQL 连接
mysql -u root -p -e "SHOW DATABASES;"

# 查看错误日志
journalctl -u ysby-user -n 50
```

### Nginx 502 错误
```bash
# 检查后端是否运行
curl http://127.0.0.1:4001/areas?level=1

# 检查 Nginx 配置
nginx -t

# 查看 Nginx 错误日志
tail -20 /var/log/nginx/error.log
```
