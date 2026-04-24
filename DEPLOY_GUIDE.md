# 益寿巴渝 - 部署指南

## 一、本地开发 / 测试模式

### 模式1: 本地前端调用本地后端 (默认)

```bash
cd apps/mobile
pnpm start
```

访问 `http://localhost:3001`，前端调用 `http://localhost:4001` 后端接口。

---

### 模式2: 本地前端调用公网后端 (手机扫码测试)

在 `apps/mobile/App.tsx` 顶部找到：

```typescript
const API_BASE = (() => {
  if (typeof process !== 'undefined' && (process.env.TEST_API === '1' || (window as any).__TEST_API__)) {
    return 'http://8.137.174.210/api';
  }
  ...
})();
```

临时修改为直接返回公网地址，或在浏览器控制台执行：

```javascript
window.__TEST_API__ = true
location.reload()
```

---

## 二、生产部署 (代码更新后推送到 ECS)

### 步骤1: 本地修改代码并构建

```bash
# 修改代码后...

# 安装依赖 (如果需要)
pnpm install

# 构建
cd apps/mobile
pnpm build
```

### 步骤2: 上传到服务器

**方式A: 宝塔面板 (推荐)**
1. 打开宝塔面板 → 文件 → `/opt/YSBY-app/frontend/dist/`
2. 清空目录，上传 `apps/mobile/dist/` 下的所有文件

**方式B: WinSCP / FTP**
1. 连接服务器
2. 进入 `/opt/YSBY-app/frontend/dist/`
3. 上传 `apps/mobile/dist/` 下的所有文件

**方式C: 命令行**
```bash
# 在 Windows PowerShell 中执行
scp -r apps/mobile/dist/* root@8.137.174.210:/opt/YSBY-app/frontend/dist/
```

### 步骤3: 访问验证

打开浏览器访问: **http://8.137.174.210/**

---

## 三、API 调用架构说明

```
本地开发 (npm start):
  localhost:3001 → localhost:4001 (直接调用)

本地测试公网 (TEST_API):
  localhost:3001 → http://8.137.174.210/api (直接调用公网)

生产环境 (npm run build):
  8.137.174.210 → /api (nginx 代理到 127.0.0.1:4001)
```

### nginx 配置 (已在服务器配置)

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:4001/;
}
```

---

## 四、后端更新

如果后端代码有修改，需要重启后端服务：

在服务器终端执行:
```bash
cd /opt/YSBY-app/mobile/services/user-service
pm2 restart user-service
```

---

## 五、完整部署流程 (每次更新代码)

```
1. 修改代码 (本地)
2. pnpm build (apps/mobile)
3. 上传 dist/ 到服务器 /opt/YSBY-app/frontend/dist/
4. 访问 http://8.137.174.210/ 验证
```

如果后端有更新，还需要:
5. 上传后端代码到服务器
6. pm2 restart user-service
