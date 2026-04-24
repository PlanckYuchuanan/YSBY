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
CREATE TABLE IF NOT EXISTS point_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount BIGINT NOT NULL COMMENT '正数=增加, 负数=减少',
  type VARCHAR(50) NOT NULL COMMENT 'sign, video, activity, exchange, etc.',
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_type (type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 视频表（预留）
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_url VARCHAR(500),
  video_url VARCHAR(500),
  duration INT COMMENT '秒',
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  status TINYINT DEFAULT 1 COMMENT '0=待审核, 1=已发布, 2=已下架',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 视频评论表（预留）
-- ============================================
CREATE TABLE IF NOT EXISTS video_comments (
  id VARCHAR(36) PRIMARY KEY,
  video_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  parent_id VARCHAR(36) DEFAULT NULL COMMENT '回复的评论ID',
  content TEXT NOT NULL,
  likes BIGINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
-- 订单表（预留）
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  order_no VARCHAR(50) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  points INT DEFAULT 0 COMMENT '使用积分抵扣',
  status TINYINT DEFAULT 0 COMMENT '0=待支付, 1=已支付, 2=已发货, 3=已完成, 4=已取消',
  address TEXT COMMENT '收货地址JSON',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_order_no (order_no),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 商品表（预留）
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  points_price INT DEFAULT 0 COMMENT '积分价格',
  stock INT DEFAULT 0,
  cover_url VARCHAR(500),
  images TEXT COMMENT '图片JSON数组',
  status TINYINT DEFAULT 1 COMMENT '0=下架, 1=上架',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
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
