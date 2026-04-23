import express from 'express';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
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

const PORT = process.env.PORT || 4004;

// 获取积分余额
app.get('/balance', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const [users] = await pool.execute('SELECT points FROM users WHERE id = ?', [userId]) as any;

    if (!users.length) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({ code: 0, data: { balance: users[0].points }, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 获取积分记录
app.get('/records', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { page = 1, pageSize = 20, type } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE user_id = ?';
    const params: any[] = [userId];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM points_records ${whereClause}`,
      params
    ) as any;
    const total = countResult[0].total;

    const [records] = await pool.execute(
      `SELECT * FROM points_records ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    ) as any;

    res.json({
      code: 0,
      data: {
        list: records,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total,
          totalPages: Math.ceil(total / Number(pageSize))
        }
      },
      message: 'success'
    });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 获取积分规则（管理员）
app.get('/rules', async (req, res) => {
  try {
    const [rules] = await pool.execute('SELECT * FROM points_rules ORDER BY action');
    res.json({ code: 0, data: rules, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 更新积分规则（管理员）
app.put('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { points, dailyLimit, enabled, description } = req.body;

    await pool.execute(
      'UPDATE points_rules SET points = ?, daily_limit = ?, enabled = ?, description = ? WHERE id = ?',
      [points, dailyLimit, enabled, description, id]
    );

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 手动调整用户积分（管理员）
app.post('/adjust', async (req, res) => {
  try {
    const { userId, points, description } = req.body;
    const adminId = req.headers['x-user-id'] as string;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.execute(
        'UPDATE users SET points = points + ? WHERE id = ?',
        [points, userId]
      );

      const [users] = await connection.execute('SELECT points FROM users WHERE id = ?', [userId]) as any;
      const balance = users[0].points;

      await connection.execute(
        'INSERT INTO points_records (id, user_id, type, points, balance, description, related_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), userId, points > 0 ? 'purchase' : 'exchange', points, balance, description || '管理员调整', adminId]
      );

      await connection.commit();
      res.json({ code: 0, data: { balance }, message: 'success' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

app.listen(PORT, () => {
  console.log(`Points service running on port ${PORT}`);
});

export default app;