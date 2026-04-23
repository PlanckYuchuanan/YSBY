import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ysby-secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Skip auth for some routes
  const publicPaths = ['/api/user/send-code', '/api/user/login', '/api/user/register'];
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未登录或登录已过期',
      data: null
    });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 401,
      message: '无效的令牌',
      data: null
    });
  }
};

export const adminAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未登录或登录已过期',
      data: null
    });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'admin' && decoded.role !== 'super') {
      return res.status(403).json({
        code: 403,
        message: '权限不足',
        data: null
      });
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 401,
      message: '无效的令牌',
      data: null
    });
  }
};

export const generateToken = (userId: string, role: string = 'user') => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};
