import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '247391qq',
  database: process.env.MYSQL_DATABASE || 'ysby',
  waitForConnections: true,
  connectionLimit: 10,
});

const JWT_SECRET = process.env.JWT_SECRET || 'ysby-secret-key-2026-change-in-production';
const JWT_EXPIRES_IN = '7d';

// 格式化用户数据
function formatUser(user: any): any {
  const { password_hash, ...rest } = user;
  return rest;
}

// 获取当前用户
app.get('/me/:userId', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND status != "deleted"',
      [req.params.userId]
    ) as any;

    if (!users.length) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    res.json({ code: 0, data: formatUser(users[0]), message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 发送验证码
app.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log(`[SMS] 发送验证码 ${code} 到 ${phone}`);

    const id = uuidv4();
    await pool.execute(
      'INSERT INTO verification_codes (id, phone, code, type, expired_at) VALUES (?, ?, ?, ?, ?)',
      [id, phone, code, 'login', expiredAt]
    );

    res.json({ code: 0, data: { code }, message: '验证码已发送（开发模式直接返回验证码）' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 注册
app.post('/register', async (req, res) => {
  try {
    const { phone, code, password, nickname } = req.body;

    // 验证验证码（开发模式跳过）
    // const [codes] = await pool.execute(
    //   'SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND used = FALSE AND expired_at > NOW() ORDER BY created_at DESC LIMIT 1',
    //   [phone, code]
    // ) as any;
    // if (!codes.length) {
    //   return res.status(400).json({ code: 400, message: '验证码无效' });
    // }

    // 检查手机号
    const [existing] = await pool.execute('SELECT id FROM users WHERE phone = ?', [phone]) as any;
    if (existing.length) {
      return res.status(400).json({ code: 400, message: '手机号已注册' });
    }

    // 创建用户
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (id, username, nickname, phone, password_hash, points) VALUES (?, ?, ?, ?, ?, ?)',
      [id, `user_${Date.now()}`, nickname, phone, passwordHash, 100]
    );

    // 生成token
    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      code: 0,
      data: { token, user: { id, phone, nickname, points: 100 } },
      message: '注册成功'
    });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 登录
app.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE phone = ? AND status != "deleted"',
      [phone]
    ) as any;

    if (!users.length) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ code: 400, message: '密码错误' });
    }

    // 更新登录时间
    await pool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    // 生成token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      code: 0,
      data: { token, user: formatUser(user) },
      message: '登录成功'
    });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});

export default app;
