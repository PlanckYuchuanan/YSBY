import express from 'express';
import mysql from 'mysql2/promise';
import Redis from 'ioredis';
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

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const PORT = process.env.PORT || 4002;

// 获取视频列表
app.get('/videos', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, userId, tag, sortBy = 'latest' } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let orderBy = 'v.created_at DESC';
    if (sortBy === 'popular') orderBy = 'v.view_count DESC';
    if (sortBy === 'random') orderBy = 'RAND()';

    let whereClause = 'WHERE v.status = "approved"';
    const params: any[] = [];

    if (userId) {
      whereClause += ' AND v.user_id = ?';
      params.push(userId);
    }

    // 获取总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM videos v ${whereClause}`,
      params
    ) as any;
    const total = countResult[0].total;

    // 获取列表
    const pageSizeNum = Number(pageSize);
    const offsetNum = Number(offset);
    const [videos] = await pool.query(
      `SELECT v.*, u.nickname, u.avatar
       FROM videos v
       LEFT JOIN users u ON v.user_id = u.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ${pageSizeNum} OFFSET ${offsetNum}`,
      params
    ) as any;

    res.json({
      code: 0,
      data: {
        list: videos,
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

// 获取视频详情
app.get('/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [videos] = await pool.execute(
      `SELECT v.*, u.nickname, u.avatar
       FROM videos v
       LEFT JOIN users u ON v.user_id = u.id
       WHERE v.id = ?`,
      [id]
    ) as any;

    if (!videos.length) {
      return res.status(404).json({ code: 404, message: '视频不存在', data: null });
    }

    // 增加播放量
    await pool.execute('UPDATE videos SET view_count = view_count + 1 WHERE id = ?', [id]);

    res.json({ code: 0, data: videos[0], message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 上传视频
app.post('/videos', async (req, res) => {
  try {
    const { userId, title, description, coverUrl, videoUrl, duration, width, height, points = 10, tags = [] } = req.body;

    const id = uuidv4();
    await pool.execute(
      `INSERT INTO videos (id, user_id, title, description, cover_url, video_url, duration, width, height, points, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [id, userId, title, description, coverUrl, videoUrl, duration, width, height, points, JSON.stringify(tags)]
    );

    res.json({ code: 0, data: { id }, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 点赞视频
app.post('/videos/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // 检查是否已点赞
    const [existing] = await pool.execute(
      'SELECT id FROM video_likes WHERE user_id = ? AND video_id = ?',
      [userId, id]
    ) as any;

    if (existing.length) {
      return res.status(400).json({ code: 400, message: '已经点赞过了', data: null });
    }

    const likeId = uuidv4();
    await pool.execute(
      'INSERT INTO video_likes (id, user_id, video_id) VALUES (?, ?, ?)',
      [likeId, userId, id]
    );

    // 更新点赞数
    await pool.execute('UPDATE videos SET like_count = like_count + 1 WHERE id = ?', [id]);

    // 发放积分
    await pool.execute(
      `INSERT INTO points_records (id, user_id, type, points, balance, description, related_id)
       SELECT ?, u.id, 'like', 1, u.points + 1, '点赞视频', ?
       FROM users u WHERE u.id = ?`,
      [uuidv4(), id, userId]
    );
    await pool.execute('UPDATE users SET points = points + 1 WHERE id = ?', [userId]);

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 取消点赞
app.delete('/videos/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    await pool.execute(
      'DELETE FROM video_likes WHERE user_id = ? AND video_id = ?',
      [userId, id]
    );

    await pool.execute('UPDATE videos SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [id]);

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 记录观看时长
app.post('/videos/:id/watch', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, watchDuration } = req.body;

    // 检查是否已记录积分
    const [records] = await pool.execute(
      'SELECT points_awarded FROM watch_records WHERE user_id = ? AND video_id = ?',
      [userId, id]
    ) as any;

    if (!records.length) {
      // 首次观看，创建记录
      await pool.execute(
        'INSERT INTO watch_records (id, user_id, video_id, watch_duration, points_awarded) VALUES (?, ?, ?, ?, FALSE)',
        [uuidv4(), userId, id, watchDuration]
      );
    } else {
      // 更新观看时长
      await pool.execute(
        'UPDATE watch_records SET watch_duration = watch_duration + ? WHERE user_id = ? AND video_id = ?',
        [watchDuration, userId, id]
      );
    }

    // 检查是否完整观看（超过90%）来发放积分
    const [videos] = await pool.execute('SELECT duration, points FROM videos WHERE id = ?', [id]) as any;
    if (videos.length) {
      const video = videos[0];
      const watchPercent = watchDuration / video.duration;

      if (watchPercent >= 0.9 && (!records.length || !records[0].points_awarded)) {
        // 发放积分
        const [userResult] = await pool.execute('SELECT points FROM users WHERE id = ?', [userId]) as any;
        const newBalance = userResult[0].points + video.points;

        await pool.execute(
          'UPDATE users SET points = points + ? WHERE id = ?',
          [video.points, userId]
        );
        await pool.execute(
          `INSERT INTO points_records (id, user_id, type, points, balance, description, related_id)
           VALUES (?, ?, 'watch_video', ?, ?, '观看视频获得', ?)`,
          [uuidv4(), userId, video.points, newBalance, id]
        );
        await pool.execute(
          'UPDATE watch_records SET points_awarded = TRUE WHERE user_id = ? AND video_id = ?',
          [userId, id]
        );
      }
    }

    res.json({ code: 0, data: null, message: 'success' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

app.listen(PORT, () => {
  console.log(`Video service running on port ${PORT}`);
});

export default app;