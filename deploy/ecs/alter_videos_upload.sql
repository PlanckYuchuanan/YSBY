-- ============================================
-- YSBY 视频上传功能数据库迁移 (MySQL 兼容版)
-- 执行: mysql -u root -p ysby < alter_videos_upload.sql
-- ============================================

-- 检查 videos 表是否已有新字段，如果没有则添加
SET @dbname = DATABASE();
SET @tablename = 'videos';

-- 检查 oss_key 字段（其他字段也一起添加）
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'oss_key'
);

-- 添加新字段（如果不存在）
SET @sql = IF(@column_exists = 0,
  CONCAT('ALTER TABLE ', @tablename,
    ' ADD COLUMN upload_channel VARCHAR(20) DEFAULT ''user'' COMMENT ''user=用户上传, platform=平台上传'' AFTER status,',
    ' ADD COLUMN uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''上传时间'' AFTER upload_channel,',
    ' ADD COLUMN reviewed_at DATETIME DEFAULT NULL COMMENT ''审核时间(null=自动审核)'' AFTER uploaded_at,',
    ' ADD COLUMN published_at DATETIME DEFAULT NULL COMMENT ''发布时间(自动审核时=uploaded_at)'' AFTER reviewed_at,',
    ' ADD COLUMN oss_key VARCHAR(500) COMMENT ''OSS文件路径(区分于video_url)'' AFTER published_at'
  ),
  'SELECT ''Columns already exist, skipping'' AS msg'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 创建索引（忽略已存在的错误）
-- ALTER TABLE videos ADD INDEX idx_uploaded (uploaded_at);
-- ALTER TABLE videos ADD INDEX idx_published (published_at);

-- 显示表结构确认
DESCRIBE videos;