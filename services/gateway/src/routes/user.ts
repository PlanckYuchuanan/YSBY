import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res) => {
  // TODO: 调用用户服务获取用户信息
  res.json({
    code: 0,
    data: null,
    message: 'success'
  });
});

// 发送验证码
router.post('/send-code', async (req, res) => {
  // TODO: 实现发送验证码逻辑
  res.json({
    code: 0,
    data: null,
    message: '验证码已发送'
  });
});

// 登录
router.post('/login', async (req, res) => {
  // TODO: 实现登录逻辑
  res.json({
    code: 0,
    data: null,
    message: 'success'
  });
});

// 注册
router.post('/register', async (req, res) => {
  // TODO: 实现注册逻辑
  res.json({
    code: 0,
    data: null,
    message: 'success'
  });
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  // TODO: 实现获取用户信息逻辑
  res.json({
    code: 0,
    data: null,
    message: 'success'
  });
});

// 更新用户信息
router.put('/profile', authMiddleware, async (req, res) => {
  // TODO: 实现更新用户信息逻辑
  res.json({
    code: 0,
    data: null,
    message: 'success'
  });
});

export default router;
