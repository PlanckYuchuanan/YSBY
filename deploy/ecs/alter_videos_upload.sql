-- ============================================
-- YSBY 视频上传功能数据库迁移
-- 执行: mysql -u root -p ysby < alter_videos_upload.sql
-- ============================================

-- videos 表新增上传相关字段（已有则跳过）
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS upload_channel VARCHAR(20) DEFAULT 'user' COMMENT 'user=用户上传, platform=平台上传' AFTER status,
  ADD COLUMN IF NOT EXISTS uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间' AFTER upload_channel,
  ADD COLUMN IF NOT EXISTS reviewed_at DATETIME DEFAULT NULL COMMENT '审核时间(null=自动审核)' AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS published_at DATETIME DEFAULT NULL COMMENT '发布时间(自动审核时=uploaded_at)' AFTER reviewed_at,
  ADD COLUMN IF NOT EXISTS oss_key VARCHAR(500) COMMENT 'OSS文件路径(区分于video_url)' AFTER published_at;

-- 创建索引
ALTER TABLE videos ADD INDEX idx_uploaded (uploaded_at);
ALTER TABLE videos ADD INDEX idx_published (published_at);

-- 显示表结构确认
DESCRIBE videos;