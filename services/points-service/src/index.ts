import express from 'express';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app: ReturnType<typeof express> = express();
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
      whereClause += ' AND business_type = ?';
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
      // 查询变动前余额
      const [users] = await connection.execute('SELECT points FROM users WHERE id = ?', [userId]) as any;
      if (!users.length) {
        await connection.rollback();
        return res.status(404).json({ code: 404, message: '用户不存在', data: null });
      }
      const balanceBefore = users[0].points;

      // 更新积分余额
      await connection.execute(
        'UPDATE users SET points = points + ? WHERE id = ?',
        [points, userId]
      );

      // 查询变动后余额
      const [updatedUsers] = await connection.execute('SELECT points FROM users WHERE id = ?', [userId]) as any;
      const balanceAfter = updatedUsers[0].points;

      // 写入积分变动记录
      await connection.execute(
        `INSERT INTO points_records
          (id, user_id, business_type, action, points, balance_before, balance_after, operator_type, operator_id, description, related_type, related_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          userId,
          points > 0 ? 'recharge' : 'adjust',
          points > 0 ? 'add' : 'reduce',
          Math.abs(points),
          balanceBefore,
          balanceAfter,
          'admin',
          adminId,
          description || (points > 0 ? '管理员充值' : '管理员扣除'),
          'admin_adjust',
          null
        ]
      );

      await connection.commit();
      res.json({ code: 0, data: { balance: balanceAfter }, message: 'success' });
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