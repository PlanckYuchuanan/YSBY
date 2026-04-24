import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app: ReturnType<typeof express> = express();
const PORT = process.env.PORT || 4000;

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[GATEWAY] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// NOTE: Do NOT use express.json() or express.urlencoded() here - it consumes
// the request body stream, making it impossible for http-proxy-middleware to
// forward POST/PUT request bodies. Each downstream service handles its own body parsing.
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes - proxy to real services
// IMPORTANT: Use 'localhost' not '127.0.0.1' because 127.0.0.1:4001 is occupied by QQ
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:4001';
const VIDEO_SERVICE = process.env.VIDEO_SERVICE_URL || 'http://localhost:4003';
const SOCIAL_SERVICE = process.env.SOCIAL_SERVICE_URL || 'http://localhost:4004';
const POINTS_SERVICE = process.env.POINTS_SERVICE_URL || 'http://localhost:4002';
const SHOP_SERVICE = process.env.SHOP_SERVICE_URL || 'http://localhost:4005';

// User service proxy (/api/user/* → user-service:4001/*)
app.use('/api/user', createProxyMiddleware({
  target: USER_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/user': '' },
  onProxyReq: (proxyReq, req) => {
    console.log(`[PROXY-USER] ${req.method} ${req.originalUrl} -> ${USER_SERVICE}${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY-USER-ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  },
}));

// Video service proxy (/api/video/* → video-service:4003/*)
app.use('/api/video', createProxyMiddleware({
  target: VIDEO_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/video': '' },
}));

// Social service proxy (/api/social/* → social-service:4004/*)
app.use('/api/social', createProxyMiddleware({
  target: SOCIAL_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/social': '' },
}));

// Points service proxy (/api/points/* → points-service:4002/*)
app.use('/api/points', createProxyMiddleware({
  target: POINTS_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/points': '' },
}));

// Shop service proxy (/api/shop/* → shop-service:4005/*)
app.use('/api/shop', createProxyMiddleware({
  target: SHOP_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/shop': '' },
}));

// Service proxy (for internal service communication)
app.use('/internal', createProxyMiddleware({
  target: process.env.INTERNAL_API_URL || 'http://localhost:4000',
  changeOrigin: true,
  pathRewrite: { '^/internal': '' },
}));

app.listen(PORT, () => {
  console.log(`Gateway service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
