import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 获取积分余额
router.get('/balance', authMiddleware, async (req, res) => {
  // TODO: 实现获取积分余额逻辑
  res.json({
    code: 0,
    data: { balance: 0 },
    message: 'success'
  });
});

// 获取积分记录
router.get('/records', authMiddleware, async (req, res) => {
  // TODO: 实现获取积分记录逻辑
  res.json({
    code: 0,
    data: {
      list: [],
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 }
    },
    message: 'success'
  });
});

// 获取积分规则列表（管理员）
router.get('/rules', authMiddleware, async (req, res) => {
  // TODO: 实现获取积分规则列表逻辑
  res.json({
    code: 0,
    data: [],
    message: 'success'
  });
});

// 更新积分规则（管理员）
router.put('/rules/:id', authMiddleware, async (req, res) => {
  // TODO: 实现更新积分规则逻辑
  res.json({
    code: 0,
    data: null,
    message: 'success'
  });
});

export default router;
