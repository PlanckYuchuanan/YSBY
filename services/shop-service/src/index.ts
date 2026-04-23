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

const PORT = process.env.PORT || 4005;

// ============ 商品 API ============

// 获取商品列表
app.get('/products', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, category, status = 'published' } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE status = ?';
    const params: any[] = [status];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      params
    ) as any;
    const total = countResult[0].total;

    const pageSizeNum = Number(pageSize);
    const offsetNum = Number(offset);
    const [products] = await pool.query(
      `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT ${pageSizeNum} OFFSET ${offsetNum}`,
      params
    ) as any;

    res.json({
      code: 0,
      data: {
        list: products,
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

// 获取商品详情
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]) as any;

    if (!products.length) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }

    res.json({ code: 0, data: products[0], message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 创建商品（管理员）
app.post('/products', async (req, res) => {
  try {
    const { name, description, images, price, stock, category, status = 'draft' } = req.body;

    const id = uuidv4();
    await pool.execute(
      'INSERT INTO products (id, name, description, images, price, stock, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, description, JSON.stringify(images || []), price, stock, category, status]
    );

    res.json({ code: 0, data: { id }, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 更新商品（管理员）
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, images, price, stock, category, status } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (images) { updates.push('images = ?'); values.push(JSON.stringify(images)); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }
    if (stock !== undefined) { updates.push('stock = ?'); values.push(stock); }
    if (category) { updates.push('category = ?'); values.push(category); }
    if (status) { updates.push('status = ?'); values.push(status); }

    if (!updates.length) {
      return res.status(400).json({ code: 400, message: '没有需要更新的字段', data: null });
    }

    values.push(id);
    await pool.execute(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 删除商品（管理员）
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// ============ 订单 API ============

// 兑换商品
app.post('/exchange', async (req, res) => {
  try {
    const { userId, productId, quantity = 1, address, phone, receiverName } = req.body;

    // 检查商品
    const [products] = await pool.execute('SELECT * FROM products WHERE id = ? AND status = "published"', [productId]) as any;
    if (!products.length) {
      return res.status(404).json({ code: 404, message: '商品不存在或已下架', data: null });
    }
    const product = products[0];

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ code: 400, message: '库存不足', data: null });
    }

    const totalPoints = product.price * quantity;

    // 检查用户积分
    const [users] = await pool.execute('SELECT points FROM users WHERE id = ?', [userId]) as any;
    if (!users.length || users[0].points < totalPoints) {
      return res.status(400).json({ code: 400, message: '积分不足', data: null });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 扣除积分
      await connection.execute('UPDATE users SET points = points - ? WHERE id = ?', [totalPoints, userId]);

      // 创建订单
      const orderId = uuidv4();
      await connection.execute(
        `INSERT INTO orders (id, user_id, product_id, quantity, total_points, status, address, phone, receiver_name)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        [orderId, userId, productId, quantity, totalPoints, address, phone, receiverName]
      );

      // 减少库存
      await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, productId]);

      // 记录积分消耗
      const [newBalance] = await connection.execute('SELECT points FROM users WHERE id = ?', [userId]) as any;
      await connection.execute(
        'INSERT INTO points_records (id, user_id, type, points, balance, description, related_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), userId, 'exchange', -totalPoints, newBalance[0].points, `兑换商品: ${product.name}`, orderId]
      );

      await connection.commit();
      res.json({ code: 0, data: { orderId }, message: '兑换成功' });
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

// 获取订单列表
app.get('/orders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { page = 1, pageSize = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE o.user_id = ?';
    const params: any[] = [userId];

    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    ) as any;
    const total = countResult[0].total;

    const [orders] = await pool.execute(
      `SELECT o.*, p.name as product_name, p.images as product_images
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    ) as any;

    res.json({
      code: 0,
      data: {
        list: orders,
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

// 获取订单详情
app.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    const [orders] = await pool.execute(
      `SELECT o.*, p.name as product_name, p.images as product_images
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.id = ? AND o.user_id = ?`,
      [id, userId]
    ) as any;

    if (!orders.length) {
      return res.status(404).json({ code: 404, message: '订单不存在', data: null });
    }

    res.json({ code: 0, data: orders[0], message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 确认收货
app.put('/orders/:id/received', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    const [orders] = await pool.execute(
      'SELECT status FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    ) as any;

    if (!orders.length) {
      return res.status(404).json({ code: 404, message: '订单不存在', data: null });
    }

    if (orders[0].status !== 'shipped') {
      return res.status(400).json({ code: 400, message: '订单状态不正确', data: null });
    }

    await pool.execute('UPDATE orders SET status = "completed" WHERE id = ?', [id]);

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 管理员更新订单状态
app.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ code: 400, message: '无效的订单状态', data: null });
    }

    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

app.listen(PORT, () => {
  console.log(`Shop service running on port ${PORT}`);
});

export default app;