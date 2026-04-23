-- YSBY 数据库初始化脚本
-- 创建日期: 2026-04-23

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ysby CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ysby;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `nickname` VARCHAR(100) NOT NULL,
  `avatar` VARCHAR(500) DEFAULT '',
  `phone` VARCHAR(20) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100),
  `status` ENUM('active', 'banned', 'deleted') DEFAULT 'active',
  `points` BIGINT DEFAULT 0,
  `last_login_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_phone` (`phone`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 视频表
CREATE TABLE IF NOT EXISTS `videos` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `cover_url` VARCHAR(500) NOT NULL,
  `video_url` VARCHAR(500) NOT NULL,
  `duration` INT NOT NULL COMMENT '秒',
  `width` INT DEFAULT 0,
  `height` INT DEFAULT 0,
  `view_count` BIGINT DEFAULT 0,
  `like_count` BIGINT DEFAULT 0,
  `comment_count` BIGINT DEFAULT 0,
  `share_count` BIGINT DEFAULT 0,
  `points` INT DEFAULT 0 COMMENT '观看获得积分',
  `tags` JSON,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 视频点赞表
CREATE TABLE IF NOT EXISTS `video_likes` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `video_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_video` (`user_id`, `video_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 会话表（即时通讯）
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` VARCHAR(36) PRIMARY KEY,
  `type` ENUM('single', 'group') NOT NULL,
  `name` VARCHAR(100),
  `avatar` VARCHAR(500),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 会话成员表
CREATE TABLE IF NOT EXISTS `conversation_members` (
  `id` VARCHAR(36) PRIMARY KEY,
  `conversation_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `role` ENUM('owner', 'admin', 'member') DEFAULT 'member',
  `unread_count` INT DEFAULT 0,
  `last_read_at` DATETIME,
  `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_conv_user` (`conversation_id`, `user_id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 消息表
CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(36) PRIMARY KEY,
  `conversation_id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `type` ENUM('text', 'image', 'video', 'voice', 'file', 'system') DEFAULT 'text',
  `content` TEXT NOT NULL,
  `status` ENUM('sending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_conversation_id` (`conversation_id`),
  INDEX `idx_sender_id` (`sender_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 话题表（需要在 posts 表之前定义）
CREATE TABLE IF NOT EXISTS `topics` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(50) UNIQUE NOT NULL,
  `description` VARCHAR(500),
  `cover_url` VARCHAR(500),
  `post_count` BIGINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 帖子表（社群）
CREATE TABLE IF NOT EXISTS `posts` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `images` JSON,
  `topic_id` VARCHAR(36),
  `like_count` BIGINT DEFAULT 0,
  `comment_count` BIGINT DEFAULT 0,
  `share_count` BIGINT DEFAULT 0,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_topic_id` (`topic_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 帖子点赞表
CREATE TABLE IF NOT EXISTS `post_likes` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `post_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_post` (`user_id`, `post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE IF NOT EXISTS `comments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `post_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `parent_id` VARCHAR(36) COMMENT '回复的评论ID',
  `reply_user_id` VARCHAR(36) COMMENT '回复的用户ID',
  `content` TEXT NOT NULL,
  `like_count` BIGINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_post_id` (`post_id`),
  INDEX `idx_parent_id` (`parent_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 积分记录表
CREATE TABLE IF NOT EXISTS `points_records` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `type` ENUM('watch_video', 'like', 'comment', 'share', 'daily_login', 'sign_up', 'purchase', 'exchange') NOT NULL,
  `points` BIGINT NOT NULL,
  `balance` BIGINT NOT NULL COMMENT '操作后余额',
  `description` VARCHAR(200),
  `related_id` VARCHAR(36) COMMENT '关联业务ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 积分规则表
CREATE TABLE IF NOT EXISTS `points_rules` (
  `id` VARCHAR(36) PRIMARY KEY,
  `action` VARCHAR(50) UNIQUE NOT NULL,
  `points` INT NOT NULL,
  `daily_limit` INT DEFAULT 0 COMMENT '每日上限，0表示无限制',
  `enabled` BOOLEAN DEFAULT TRUE,
  `description` VARCHAR(200),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品表
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `images` JSON,
  `price` BIGINT NOT NULL COMMENT '积分价格',
  `stock` INT DEFAULT 0,
  `category` VARCHAR(50),
  `status` ENUM('draft', 'published', 'offline') DEFAULT 'draft',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `quantity` INT DEFAULT 1,
  `total_points` BIGINT NOT NULL,
  `status` ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  `address` VARCHAR(500),
  `phone` VARCHAR(20),
  `receiver_name` VARCHAR(50),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 观看记录表（用于积分发放控制）
CREATE TABLE IF NOT EXISTS `watch_records` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `video_id` VARCHAR(36) NOT NULL,
  `watch_duration` INT DEFAULT 0 COMMENT '观看时长（秒）',
  `points_awarded` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_video` (`user_id`, `video_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 短信验证码表
CREATE TABLE IF NOT EXISTS `verification_codes` (
  `id` VARCHAR(36) PRIMARY KEY,
  `phone` VARCHAR(20) NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  `type` VARCHAR(20) DEFAULT 'login',
  `used` BOOLEAN DEFAULT FALSE,
  `expired_at` DATETIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_phone_code` (`phone`, `code`),
  INDEX `idx_expired_at` (`expired_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 管理员表
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(36) PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(100),
  `role` ENUM('super', 'admin', 'editor') DEFAULT 'admin',
  `status` ENUM('active', 'banned') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化默认积分规则
INSERT INTO `points_rules` (`id`, `action`, `points`, `daily_limit`, `enabled`, `description`) VALUES
  (UUID(), 'watch_video', 10, 50, TRUE, '观看视频（完整观看一部视频）'),
  (UUID(), 'like', 1, 30, TRUE, '点赞'),
  (UUID(), 'comment', 2, 20, TRUE, '评论'),
  (UUID(), 'share', 5, 10, TRUE, '分享'),
  (UUID(), 'daily_login', 5, 1, TRUE, '每日登录'),
  (UUID(), 'sign_up', 100, 1, TRUE, '注册奖励');
