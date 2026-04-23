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

const PORT = process.env.PORT || 4003;

// ============ 话题 API ============

// 获取话题列表
app.get('/topics', async (req, res) => {
  try {
    const [topics] = await pool.execute('SELECT * FROM topics ORDER BY post_count DESC');
    res.json({ code: 0, data: topics, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// ============ 帖子 API ============

// 获取帖子列表
app.get('/posts', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, topicId, userId, sortBy = 'latest' } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = 'WHERE p.status = "approved"';
    const params: any[] = [];

    if (topicId) {
      whereClause += ' AND p.topic_id = ?';
      params.push(topicId);
    }
    if (userId) {
      whereClause += ' AND p.user_id = ?';
      params.push(userId);
    }

    let orderBy = 'p.created_at DESC';
    if (sortBy === 'popular') orderBy = 'p.like_count DESC';

    // 获取总数
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM posts p ${whereClause}`,
      params
    ) as any;
    const total = countResult[0].total;

    // 获取列表
    const [posts] = await pool.execute(
      `SELECT p.*, u.nickname, u.avatar
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    ) as any;

    res.json({
      code: 0,
      data: {
        list: posts,
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

// 获取帖子详情
app.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await pool.execute(
      `SELECT p.*, u.nickname, u.avatar
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ? AND p.status = "approved"`,
      [id]
    ) as any;

    if (!posts.length) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }

    res.json({ code: 0, data: posts[0], message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 发布帖子
app.post('/posts', async (req, res) => {
  try {
    const { userId, title, content, images, topicId } = req.body;

    const id = uuidv4();
    await pool.execute(
      'INSERT INTO posts (id, user_id, title, content, images, topic_id, status) VALUES (?, ?, ?, ?, ?, ?, "approved")',
      [id, userId, title, content, JSON.stringify(images || []), topicId || null]
    );

    // 更新话题帖子数
    if (topicId) {
      await pool.execute('UPDATE topics SET post_count = post_count + 1 WHERE id = ?', [topicId]);
    }

    res.json({ code: 0, data: { id }, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 删除帖子
app.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    // 检查权限
    const [posts] = await pool.execute('SELECT user_id, topic_id FROM posts WHERE id = ?', [id]) as any;
    if (!posts.length) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }
    if (posts[0].user_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权删除', data: null });
    }

    await pool.execute('DELETE FROM posts WHERE id = ?', [id]);

    // 更新话题帖子数
    if (posts[0].topic_id) {
      await pool.execute('UPDATE topics SET post_count = GREATEST(post_count - 1, 0) WHERE id = ?', [posts[0].topic_id]);
    }

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 点赞帖子
app.post('/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?',
      [userId, id]
    ) as any;

    if (existing.length) {
      return res.status(400).json({ code: 400, message: '已经点赞过了', data: null });
    }

    const likeId = uuidv4();
    await pool.execute(
      'INSERT INTO post_likes (id, user_id, post_id) VALUES (?, ?, ?)',
      [likeId, userId, id]
    );

    await pool.execute('UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [id]);

    // 发放积分
    await pool.execute('UPDATE users SET points = points + 1 WHERE id = ?', [userId]);
    const [user] = await pool.execute('SELECT points FROM users WHERE id = ?', [userId]) as any;
    await pool.execute(
      'INSERT INTO points_records (id, user_id, type, points, balance, description, related_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), userId, 'like', 1, user[0].points, '点赞帖子', id]
    );

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 取消点赞
app.delete('/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    await pool.execute('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?', [userId, id]);
    await pool.execute('UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [id]);

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// ============ 评论 API ============

// 获取评论列表
app.get('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM comments WHERE post_id = ?',
      [id]
    ) as any;
    const total = countResult[0].total;

    const [comments] = await pool.execute(
      `SELECT c.*, u.nickname, u.avatar, ru.nickname as reply_nickname
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN users ru ON c.reply_user_id = ru.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC
       LIMIT ? OFFSET ?`,
      [id, Number(pageSize), offset]
    ) as any;

    res.json({
      code: 0,
      data: {
        list: comments,
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

// 发布评论
app.post('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, content, parentId, replyUserId } = req.body;

    const commentId = uuidv4();
    await pool.execute(
      'INSERT INTO comments (id, post_id, user_id, content, parent_id, reply_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [commentId, id, userId, content, parentId || null, replyUserId || null]
    );

    // 更新评论数
    await pool.execute('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?', [id]);

    // 发放积分
    await pool.execute('UPDATE users SET points = points + 2 WHERE id = ?', [userId]);
    const [user] = await pool.execute('SELECT points FROM users WHERE id = ?', [userId]) as any;
    await pool.execute(
      'INSERT INTO points_records (id, user_id, type, points, balance, description, related_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), userId, 'comment', 2, user[0].points, '发布评论', commentId]
    );

    res.json({ code: 0, data: { id: commentId }, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 删除评论
app.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    const [comments] = await pool.execute('SELECT user_id, post_id FROM comments WHERE id = ?', [id]) as any;
    if (!comments.length) {
      return res.status(404).json({ code: 404, message: '评论不存在', data: null });
    }
    if (comments[0].user_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权删除', data: null });
    }

    await pool.execute('DELETE FROM comments WHERE id = ?', [id]);
    await pool.execute('UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ?', [comments[0].post_id]);

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 点赞评论
app.post('/comments/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    await pool.execute('UPDATE comments SET like_count = like_count + 1 WHERE id = ?', [id]);

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

app.listen(PORT, () => {
  console.log(`Social service running on port ${PORT}`);
});

export default app;