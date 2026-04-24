import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes - proxy to real services
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
