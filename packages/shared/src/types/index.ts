/**
 * API 统一响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 用户相关类型
 */
export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  phone?: string;
  email?: string;
  status: 'active' | 'banned' | 'deleted';
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  phone: string;
  code?: string;    // 短信验证码
  password?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  phone: string;
  code: string;
  password: string;
  nickname: string;
}

/**
 * 视频相关类型
 */
export interface Video {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  videoUrl: string;
  duration: number;       // 秒
  width: number;
  height: number;
  userId: string;
  user?: User;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  points: number;         // 观看获得积分
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface VideoListParams {
  page: number;
  pageSize: number;
  userId?: string;
  tag?: string;
  sortBy?: 'latest' | 'popular' | 'random';
}

/**
 * 即时通讯相关类型
 */
export interface IMMessage {
  id: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'system';
  content: string;
  senderId: string;
  receiverId: string;       // 单聊时为用户ID，群聊时为群ID
  conversationType: 'single' | 'group';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'single' | 'group';
  name?: string;
  avatar?: string;
  memberIds: string[];
  lastMessage?: IMMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupInfo {
  id: string;
  name: string;
  avatar: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

/**
 * 社群相关类型
 */
export interface Post {
  id: string;
  userId: string;
  user?: User;
  title: string;
  content: string;
  images: string[];
  topicId?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  parentId?: string;       // 回复的评论ID
  replyUserId?: string;    // 回复的用户ID
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  postCount: number;
  createdAt: string;
}

/**
 * 积分相关类型
 */
export interface PointsRecord {
  id: string;
  userId: string;
  type: 'watch_video' | 'like' | 'comment' | 'share' | 'daily_login' | 'sign_up' | 'purchase' | 'exchange';
  points: number;
  balance: number;
  description: string;
  relatedId?: string;     // 关联的业务ID
  createdAt: string;
}

export interface PointsRule {
  id: string;
  action: string;
  points: number;
  dailyLimit: number;     // 每日上限
  enabled: boolean;
  description: string;
}

/**
 * 商城相关类型
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;          // 积分价格
  stock: number;
  category: string;
  status: 'draft' | 'published' | 'offline';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  quantity: number;
  totalPoints: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  address?: string;
  phone?: string;
  receiverName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 错误码
 */
export enum ErrorCode {
  SUCCESS = 0,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
  // 业务错误码
  USER_NOT_FOUND = 1001,
  USER_BANNED = 1002,
  INVALID_CREDENTIALS = 1003,
  PHONE_ALREADY_EXISTS = 1004,
  INVALID_VERIFICATION_CODE = 1005,
  VIDEO_NOT_FOUND = 2001,
  VIDEO_UPLOAD_FAILED = 2002,
  INSUFFICIENT_POINTS = 3001,
  PRODUCT_NOT_FOUND = 4001,
  PRODUCT_OUT_OF_STOCK = 4002,
  ORDER_NOT_FOUND = 5001,
}