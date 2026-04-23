import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import userRoutes from './routes/user';
import videoRoutes from './routes/video';
import imRoutes from './routes/im';
import socialRoutes from './routes/social';
import pointsRoutes from './routes/points';
import shopRoutes from './routes/shop';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/im', imRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/shop', shopRoutes);

// Service proxy (for internal service communication)
app.use('/internal', createProxyMiddleware({
  target: process.env.INTERNAL_API_URL || 'http://localhost:4000',
  changeOrigin: true,
  pathRewrite: { '^/internal': '' },
}));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gateway service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
