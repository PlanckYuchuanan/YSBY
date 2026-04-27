-- ============================================
-- YSBY 项目数据库初始化脚本
-- 执行方式: mysql -u root -p < init_db.sql
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS ysby DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ysby;

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  nickname VARCHAR(100) NOT NULL,
  avatar VARCHAR(500),
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  location VARCHAR(100),
  location_code VARCHAR(12),
  gender TINYINT DEFAULT NULL COMMENT '0=未知, 1=男, 2=女',
  birthday DATE DEFAULT NULL,
  status ENUM('active', 'banned', 'deleted') DEFAULT 'active',
  points BIGINT DEFAULT 0,
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 验证码表
-- ============================================
CREATE TABLE IF NOT EXISTS verification_codes (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL COMMENT 'login, register, reset',
  expired_at DATETIME NOT NULL,
  used TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone_code (phone, code),
  INDEX idx_expired (expired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 行政区划表（地区选择器）
-- ============================================
CREATE TABLE IF NOT EXISTS areas (
  id VARCHAR(12) PRIMARY KEY COMMENT 'GB/T 2260 代码',
  name VARCHAR(50) NOT NULL,
  level TINYINT NOT NULL COMMENT '1=省/直辖市/自治区, 2=市, 3=区县',
  parent_id VARCHAR(12) DEFAULT NULL,
  INDEX idx_level (level),
  INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 积分记录表
-- ============================================
-- 记录用户积分的每一笔变动，包含余额快照，保证可追溯可对账
CREATE TABLE IF NOT EXISTS points_records (
  id              VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id         VARCHAR(36) NOT NULL COMMENT '用户ID',
  business_type   VARCHAR(50) NOT NULL COMMENT '业务类型: sign/video/like/comment/exchange/register/adjust/recharge',
  action          VARCHAR(20) NOT NULL COMMENT '动作: add(增加)/reduce(减少)',
  points          INT NOT NULL COMMENT '变动积分（正数）',
  balance_before  BIGINT NOT NULL COMMENT '变动前余额',
  balance_after   BIGINT NOT NULL COMMENT '变动后余额',
  operator_type   VARCHAR(20) NOT NULL DEFAULT 'system' COMMENT '操作者类型: user/system/admin',
  operator_id     VARCHAR(36) DEFAULT NULL COMMENT '操作者ID',
  description     VARCHAR(255) COMMENT '变动描述',
  related_type    VARCHAR(50) DEFAULT NULL COMMENT '关联业务类型: video/post/order etc.',
  related_id      VARCHAR(36) DEFAULT NULL COMMENT '关联业务ID',
  idempotent_key  VARCHAR(64) DEFAULT NULL COMMENT '幂等键，防止重复扣积分',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_business_type (business_type),
  INDEX idx_idempotent (idempotent_key),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 视频表
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
  id              VARCHAR(36) PRIMARY KEY,
  user_id         VARCHAR(36) NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  cover_url       VARCHAR(500) COMMENT '封面图URL',
  video_url       VARCHAR(500) COMMENT '视频文件URL',
  duration        INT COMMENT '视频时长(秒)',
  width           INT,
  height          INT,
  tags            TEXT COMMENT '标签JSON数组',
  points          INT DEFAULT 10 COMMENT '完整观看奖励积分',
  view_count      BIGINT DEFAULT 0 COMMENT '播放量',
  like_count      BIGINT DEFAULT 0 COMMENT '点赞数',
  status          VARCHAR(20) DEFAULT 'approved' COMMENT 'pending/approved/rejected',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 视频点赞表
-- ============================================
CREATE TABLE IF NOT EXISTS video_likes (
  id          VARCHAR(36) PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  video_id    VARCHAR(36) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_video (user_id, video_id),
  INDEX idx_video (video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 视频观看记录表
-- ============================================
CREATE TABLE IF NOT EXISTS watch_records (
  id                VARCHAR(36) PRIMARY KEY,
  user_id           VARCHAR(36) NOT NULL,
  video_id          VARCHAR(36) NOT NULL,
  watch_duration    INT DEFAULT 0 COMMENT '累计观看时长(秒)',
  points_awarded    TINYINT DEFAULT 0 COMMENT '是否已发放积分: 0=未发放, 1=已发放',
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_video (user_id, video_id),
  INDEX idx_user (user_id),
  INDEX idx_video (video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 视频评论表（与 social-service 的 comments 共用）
-- ============================================
CREATE TABLE IF NOT EXISTS video_comments (
  id              VARCHAR(36) PRIMARY KEY,
  video_id        VARCHAR(36) NOT NULL COMMENT 'video_id 或 post_id（根据业务场景）',
  user_id         VARCHAR(36) NOT NULL,
  parent_id       VARCHAR(36) DEFAULT NULL COMMENT '回复的评论ID（楼中楼）',
  reply_user_id   VARCHAR(36) DEFAULT NULL COMMENT '回复目标用户ID',
  content         TEXT NOT NULL,
  like_count      BIGINT DEFAULT 0 COMMENT '点赞数',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_video (video_id),
  INDEX idx_user (user_id),
  INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 健康打卡表（预留）
-- ============================================
CREATE TABLE IF NOT EXISTS health_checkins (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  steps INT DEFAULT 0 COMMENT '步数',
  water INT DEFAULT 0 COMMENT '饮水量(ml)',
  sleep_hours DECIMAL(3,1) DEFAULT 0 COMMENT '睡眠时长(小时)',
  mood VARCHAR(20) COMMENT '心情: happy, normal, sad',
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_date (user_id, date),
  INDEX idx_user (user_id),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 话题表
-- ============================================
CREATE TABLE IF NOT EXISTS topics (
  id              VARCHAR(36) PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  cover_url       VARCHAR(500),
  post_count      INT DEFAULT 0 COMMENT '帖子数量',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_post_count (post_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 帖子表
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id              VARCHAR(36) PRIMARY KEY,
  user_id         VARCHAR(36) NOT NULL,
  topic_id        VARCHAR(36) DEFAULT NULL,
  title           VARCHAR(200) NOT NULL,
  content         TEXT NOT NULL,
  images          TEXT COMMENT '图片JSON数组',
  like_count      BIGINT DEFAULT 0 COMMENT '点赞数',
  comment_count   BIGINT DEFAULT 0 COMMENT '评论数',
  status          VARCHAR(20) DEFAULT 'approved' COMMENT 'pending/approved/rejected',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_topic (topic_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 帖子点赞表
-- ============================================
CREATE TABLE IF NOT EXISTS post_likes (
  id          VARCHAR(36) PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  post_id     VARCHAR(36) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_post (user_id, post_id),
  INDEX idx_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 订单表
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id              VARCHAR(36) PRIMARY KEY,
  user_id         VARCHAR(36) NOT NULL,
  product_id      VARCHAR(36) NOT NULL COMMENT '商品ID',
  order_no        VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  quantity        INT DEFAULT 1 COMMENT '兑换数量',
  total_points    INT NOT NULL COMMENT '消耗积分总额',
  status          VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/paid/shipped/completed/cancelled',
  address         TEXT COMMENT '收货地址',
  phone           VARCHAR(20) COMMENT '收货人电话',
  receiver_name   VARCHAR(100) COMMENT '收货人姓名',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_order_no (order_no),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 商品表
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id              VARCHAR(36) PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  price           DECIMAL(10,2) NOT NULL COMMENT '现金价格（元）',
  points_price    INT DEFAULT 0 COMMENT '积分价格',
  stock           INT DEFAULT 0 COMMENT '库存数量',
  cover_url       VARCHAR(500) COMMENT '封面图URL',
  images          TEXT COMMENT '图片JSON数组',
  category        VARCHAR(50) COMMENT '商品分类',
  status          VARCHAR(20) DEFAULT 'published' COMMENT 'draft/published/offline',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 消息表（预留）
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  from_user_id VARCHAR(36) NOT NULL,
  to_user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' COMMENT 'text, image, video, system',
  is_read TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_from (from_user_id),
  INDEX idx_to (to_user_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
SELECT '数据库初始化完成!' AS status;
