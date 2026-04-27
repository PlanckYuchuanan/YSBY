import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: ReturnType<typeof express> = express();
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

// 获取地区列表（支持三级联动）
app.get('/areas', async (req, res) => {
  try {
    const { parent_id, level } = req.query;

    let sql = 'SELECT * FROM areas WHERE 1=1';
    const params: any[] = [];

    if (level) {
      sql += ' AND level = ?';
      params.push(Number(level));
    }

    if (parent_id) {
      sql += ' AND parent_id = ?';
      params.push(parent_id);
    }

    sql += ' ORDER BY id ASC';

    const [rows] = await pool.execute(sql, params) as any;
    res.json({ code: 0, data: rows, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

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

// 更新用户资料
app.put('/me/:userId', async (req, res) => {
  try {
    const { nickname, avatar, gender, birthday, location, location_code } = req.body;

    // 构建更新字段
    const updates: string[] = [];
    const values: any[] = [];

    if (nickname !== undefined) { updates.push('nickname = ?'); values.push(nickname); }
    if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar); }
    if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
    if (birthday !== undefined) { updates.push('birthday = ?'); values.push(birthday); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (location_code !== undefined) { updates.push('location_code = ?'); values.push(location_code); }

    if (updates.length === 0) {
      return res.status(400).json({ code: 400, message: '没有要更新的字段' });
    }

    values.push(req.params.userId);

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.userId]) as any;

    res.json({ code: 0, data: formatUser(users[0]), message: '更新成功' });
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

    // 检查手机号
    const [existing] = await pool.execute('SELECT id FROM users WHERE phone = ?', [phone]) as any;
    if (existing.length) {
      return res.status(400).json({ code: 400, message: '手机号已注册' });
    }

    // 创建用户（事务保证积分记录完整）
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const regConn = await pool.getConnection();
    await regConn.beginTransaction();
    try {
      await regConn.execute(
        'INSERT INTO users (id, username, nickname, phone, password_hash, points) VALUES (?, ?, ?, ?, ?, ?)',
        [id, `user_${Date.now()}`, nickname, phone, passwordHash, 100]
      );

      // 写入初始积分记录
      await regConn.execute(
        `INSERT INTO points_records
          (id, user_id, business_type, action, points, balance_before, balance_after, operator_type, operator_id, description, related_type, related_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), id, 'register', 'add', 100, 0, 100, 'system', null, '新用户注册奖励', 'user', id]
      );

      await regConn.commit();

      // 生成token
      const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.json({
        code: 0,
        data: { token, user: { id, phone, nickname, points: 100 } },
        message: '注册成功'
      });
    } catch (err) {
      await regConn.rollback();
      throw err;
    } finally {
      regConn.release();
    }
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