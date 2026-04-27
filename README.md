# YSBY 项目

> 短视频 + 社群 + 即时通讯 + 积分商城

## 技术栈

| 端 | 技术 |
|---|---|
| 移动App | React Native + TypeScript |
| Web管理端 | React + TypeScript |
| 后端 | Node.js + TypeScript |
| 数据库 | MySQL |
| 即时通讯 | 自建 WebSocket + Redis |
| 视频存储 | 云存储 + CDN |

## 项目结构

```
ysby-project/
├── apps/
│   ├── mobile/          # React Native App
│   └── admin/           # Web管理端
├── packages/
│   └── shared/          # 共享类型、工具
├── services/             # 后端微服务
│   ├── gateway/         # API网关
│   ├── user-service/    # 用户服务
│   ├── video-service/   # 视频服务
│   ├── im-service/      # 即时通讯
│   ├── social-service/  # 社群服务
│   ├── points-service/  # 积分服务
│   └── shop-service/    # 商城服务
└── infra/               # 基础设施配置
```

## 快速启动

### 前置要求

- Node.js >= 18
- Docker Desktop
- pnpm (包管理器)

### 启动本地开发环境

```bash
# 1. 安装依赖
pnpm install

# 2. 启动基础设施（MySQL、Redis）
cd infra && docker-compose up -d

# 3. 初始化数据库
pnpm db:migrate

# 4. 启动所有服务（开发模式）
pnpm dev
```

### 单独启动某个服务

```bash
# 启动App
cd apps/mobile && pnpm start

# 启动管理端
cd apps/admin && pnpm dev

# 启动某个后端服务
cd services/gateway && pnpm dev
```

## 模块说明

### apps/mobile
用户端App，包含：
- 视频流（刷视频）
- 即时通讯（单聊、群聊）
- 社群（帖子、评论）
- 积分商城

### apps/admin
Web管理端，包含：
- 用户管理
- 内容审核
- 数据统计
- 商城管理

### services/*
后端微服务，每个服务职责单一：
- `gateway` - 统一入口，路由分发
- `user-service` - 注册、登录、认证
- `video-service` - 视频上传、存储、推荐
- `im-service` - WebSocket长连接、消息推送
- `social-service` - 帖子、评论、点赞
- `points-service` - 积分获取、消耗
- `shop-service` - 商品、订单、兑换

## 开发规范

- 统一使用 TypeScript
- API响应格式：`{ code, data, message }`
- 命名规范：小写字母 + 下划线（数据库），小驼峰（代码）
- Git仓库地址：`https://github.com/PlanckYuchuanan/YSBY.git`



## 很重要的！

1. **文档在 `/rules/` 下**，每次必须阅读（但不要只看这些，按需参考项目所有文件）
2. **每次代码变更后**，如果涉及接口或数据库，必须同步更新 `/rules/` 下的对应文档：
   - 新增/修改 API → 更新 `rules/接口文档.MD`
   - 新增/修改表结构 → 更新 `rules/数据库文档.MD`
   - 项目架构/规范变更 → 更新 `rules/AI的参考文档.md` 和 `README.md`

## 待讨论的功能点

1. [ ] 用户注册登录流程
2. [ ] 视频推荐算法
3. [ ] 积分获取/消耗规则
4. [ ] 即时通讯消息类型
5. [ ] 商城商品类型

---

**项目初始化时间**: 2026-04-23
