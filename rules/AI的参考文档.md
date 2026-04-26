# AI 的参考文档

> 本文件供 AI 开发助手了解项目全貌，快速上手。
> 最后更新：2026-04-26

---

## 项目概览

**益寿巴渝 (YSBY)** — 一个健康养生 + 视频内容 + 积分商城的移动端应用。

- **技术栈**：React + Vite（前端）、Node.js + Express（后端微服务）
- **架构**：微服务 + API Gateway
- **部署**：阿里云 ECS，Nginx 反向代理，PM2 管理进程
- **数据库**：MySQL（主数据）+ Redis（缓存/WebSocket 状态）
- **包管理**：pnpm（workspace monorepo）

---

## 项目结构

```
YSBY/
├── apps/
│   └── mobile/            # React 移动端前端 (Vite)
│       ├── App.tsx          # 主组件，包含所有页面
│       └── dist/           # 构建产物
├── services/               # 微服务
│   ├── gateway/            # API 网关 (端口 4000)
│   ├── user-service/       # 用户服务 (端口 4001)
│   ├── video-service/      # 视频服务 (端口 4002)
│   ├── points-service/     # 积分服务 (端口 4003)
│   ├── social-service/     # 社交服务 (端口 4004)
│   ├── shop-service/       # 商城服务 (端口 4005)
│   └── im-service/         # 即时通讯 WebSocket (端口 8080)
├── deploy/
│   └── ecs/                # 部署相关文件
│       ├── deploy.sh        # 一键部署脚本
│       ├── DEPLOY_GUIDE.md  # 手动部署指南
│       ├── init_db.sql      # 数据库初始化脚本
│       └── nginx-ysby.conf  # Nginx 配置
└── rules/
    ├── AI的参考文档.md      # 本文件
    ├── 接口文档.MD          # API 接口文档（所有服务的 REST API）
    └── 数据库文档.MD        # 数据库表结构文档
```

---

## 微服务架构

### 端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| gateway | 4000 | API 统一入口，nginx → gateway |
| user-service | 4001 | 用户认证、个人资料、地区数据 |
| video-service | 4002 | 视频列表、点赞、观看积分 |
| points-service | 4003 | 积分余额、积分记录 |
| social-service | 4004 | 话题、帖子、评论 |
| shop-service | 4005 | 商品、订单兑换 |
| im-service | 8080 | WebSocket 即时通讯 |

### Gateway 路由

```
/api/user/*   → user-service:4001
/api/video/*  → video-service:4002
/api/points/* → points-service:4003
/api/social/* → social-service:4004
/api/shop/*   → shop-service:4005
```

---

## 关键开发规范

### 1. API 规范

所有 API 统一响应格式：
```json
{
  "code": 0,
  "data": {},
  "message": "success"
}
```

前端 `API_BASE` 配置：
```javascript
const API_BASE = (() => {
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }
  return '/api';  // nginx 代理到 gateway:4000
})();
```

### 2. 认证

JWT Token，登录后存 `localStorage.token`，请求头：
```
Authorization: Bearer <token>
```

### 3. 数据库

- 字符集：`utf8mb4` / `utf8mb4_unicode_ci`
- 主键：UUID VARCHAR(36)
- 时间：DATETIME DEFAULT CURRENT_TIMESTAMP

### 4. 前端开发

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev  # → http://localhost:3001

# 生产构建
pnpm build
```

### 5. 后端服务开发

```bash
# 构建 TypeScript
cd services/xxx-service
npx tsc

# 直接运行（开发模式）
npx tsx src/index.ts

# 编译后运行
node dist/index.js
```

### 6. 部署

```bash
# ECS 上执行
cd /opt/YSBY-app
git pull origin main
bash deploy/ecs/deploy.sh
```

---

## 功能模块现状

### ✅ 已完成

- 用户注册/登录（手机号+密码）
- JWT Token 认证
- 个人资料编辑（昵称/性别/生日/头像/地区）
- 行政区划三级联动选择器（GB/T 2260）
- 视频列表/详情（骨架）
- 积分余额/记录
- 社交帖子/评论（骨架）
- 商品列表/兑换（骨架）
- WebSocket 即时通讯（骨架）
- 健康打卡表结构
- 部署脚本 + Nginx 配置

### ⚙️ 进行中

- [ ] 验证码真实发送（当前开发模式直接返回）
- [ ] 视频上传功能
- [ ] 积分签到任务
- [ ] 消息持久化到 MySQL
- [ ] 群聊功能

### ❌ 未开始

- [ ] 管理员后台
- [ ] 视频/帖子的内容审核
- [ ] 推送通知
- [ ] 支付宝/微信支付
- [ ] 数据分析报表

---

## ECS 部署信息

| 项目 | 值 |
|------|---|
| ECS IP | 8.137.174.210 |
| 项目路径 | /opt/YSBY-app |
| 前端静态文件 | /opt/YSBY-app/frontend/dist |
| 数据库 | MySQL，root 密码 `247391qq`，数据库 `ysby` |
| 服务管理 | PM2 |
| Nginx 配置 | /etc/nginx/nginx.conf |
| 健康检查 | http://8.137.174.210/api/user/areas?level=1 |
| 部署脚本 | /opt/YSBY-app/deploy/ecs/deploy.sh |

---

## 环境变量

### user-service
```bash
PORT=4001
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=247391qq
MYSQL_DATABASE=ysby
JWT_SECRET=ysby-secret-key-2026-change-in-production
```

### gateway
```bash
PORT=4000
USER_SERVICE_URL=http://localhost:4001
VIDEO_SERVICE_URL=http://localhost:4003
SOCIAL_SERVICE_URL=http://localhost:4004
POINTS_SERVICE_URL=http://localhost:4002
SHOP_SERVICE_URL=http://localhost:4005
```

### im-service
```bash
WS_PORT=8080
REDIS_URL=redis://localhost:6379
JWT_SECRET=ysby-secret-key-change-in-production
```

---

## 参考文档

- 接口文档：`rules/接口文档.MD`
- 数据库文档：`rules/数据库文档.MD`
- 部署指南：`deploy/ecs/DEPLOY_GUIDE.md`