import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API 服务配置
 * 开发环境：直接调用各个微服务
 */

// API 服务端口
const USER_SERVICE_URL = 'http://10.0.2.2:4001';  // Android 模拟器使用 10.0.2.2 访问宿主机
const VIDEO_SERVICE_URL = 'http://10.0.2.2:4002';
const SOCIAL_SERVICE_URL = 'http://10.0.2.2:4003';
const POINTS_SERVICE_URL = 'http://10.0.2.2:4004';
const SHOP_SERVICE_URL = 'http://10.0.2.2:4005';
const WS_URL = 'ws://10.0.2.2:8080';

// Token 管理
let tokenCache: string | null = null;

export async function setToken(token: string) {
  tokenCache = token;
  await AsyncStorage.setItem('ysby_token', token);
}

export async function getToken(): Promise<string | null> {
  if (tokenCache) return tokenCache;
  tokenCache = await AsyncStorage.getItem('ysby_token');
  return tokenCache;
}

export async function clearToken() {
  tokenCache = null;
  await AsyncStorage.removeItem('ysby_token');
}

// 通用请求方法
async function request<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<{ code: number; data: T; message: string }> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
}

// ============ 用户 API ============
export const userApi = {
  /** 发送验证码 */
  sendCode: (phone: string) =>
    request(USER_SERVICE_URL, '/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  /** 登录 */
  login: (data: { phone: string; password: string }) =>
    request<{ token: string; user: any }>(USER_SERVICE_URL, '/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 注册 */
  register: (data: { phone: string; password: string; nickname: string; code?: string }) =>
    request<{ token: string; user: any }>(USER_SERVICE_URL, '/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 获取用户信息 */
  getMe: (userId: string) =>
    request<any>(USER_SERVICE_URL, `/me/${userId}`, { method: 'GET' }),
};

// ============ 视频 API ============
export const videoApi = {
  /** 获取视频列表 */
  getVideos: (params?: { page?: number; pageSize?: number; sortBy?: string }) => {
    const query = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
    ).toString() : '';
    return request<{ list: any[]; pagination: any }>(VIDEO_SERVICE_URL, `/videos${query}`, { method: 'GET' });
  },

  /** 获取视频详情 */
  getVideo: (id: string) =>
    request<any>(VIDEO_SERVICE_URL, `/videos/${id}`, { method: 'GET' }),

  /** 点赞视频 */
  likeVideo: (id: string) =>
    request(VIDEO_SERVICE_URL, `/videos/${id}/like`, { method: 'POST' }),

  /** 取消点赞 */
  unlikeVideo: (id: string) =>
    request(VIDEO_SERVICE_URL, `/videos/${id}/like`, { method: 'DELETE' }),

  /** 记录观看时长 */
  recordWatch: (id: string, watchDuration: number) =>
    request(VIDEO_SERVICE_URL, `/videos/${id}/watch`, {
      method: 'POST',
      body: JSON.stringify({ watchDuration }),
    }),
};

// ============ 社群 API ============
export const socialApi = {
  /** 获取话题列表 */
  getTopics: () =>
    request<any[]>(SOCIAL_SERVICE_URL, '/topics', { method: 'GET' }),

  /** 获取帖子列表 */
  getPosts: (params?: { page?: number; pageSize?: number; topicId?: string }) => {
    const query = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
    ).toString() : '';
    return request<{ list: any[]; pagination: any }>(SOCIAL_SERVICE_URL, `/posts${query}`, { method: 'GET' });
  },

  /** 获取帖子详情 */
  getPost: (id: string) =>
    request<any>(SOCIAL_SERVICE_URL, `/posts/${id}`, { method: 'GET' }),

  /** 发布帖子 */
  createPost: (data: { title: string; content: string; images?: string[]; topicId?: string }) =>
    request(SOCIAL_SERVICE_URL, '/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 点赞帖子 */
  likePost: (id: string) =>
    request(SOCIAL_SERVICE_URL, `/posts/${id}/like`, { method: 'POST' }),

  /** 获取评论列表 */
  getComments: (postId: string, page = 1) =>
    request<{ list: any[]; pagination: any }>(SOCIAL_SERVICE_URL, `/posts/${postId}/comments?page=${page}`, { method: 'GET' }),

  /** 发布评论 */
  createComment: (postId: string, data: { content: string; parentId?: string }) =>
    request(SOCIAL_SERVICE_URL, `/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============ 积分 API ============
export const pointsApi = {
  /** 获取积分余额 */
  getBalance: (userId: string) => {
    const headers: Record<string, string> = { 'x-user-id': userId };
    return request<{ balance: number }>(POINTS_SERVICE_URL, '/balance', { headers: headers as any });
  },

  /** 获取积分记录 */
  getRecords: (userId: string, page = 1) => {
    const headers: Record<string, string> = { 'x-user-id': userId };
    return request<{ list: any[]; pagination: any }>(POINTS_SERVICE_URL, `/records?page=${page}`, { headers: headers as any });
  },
};

// ============ 商城 API ============
export const shopApi = {
  /** 获取商品列表 */
  getProducts: (params?: { page?: number; pageSize?: number; category?: string }) => {
    const query = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
    ).toString() : '';
    return request<{ list: any[]; pagination: any }>(SHOP_SERVICE_URL, `/products${query}`, { method: 'GET' });
  },

  /** 获取商品详情 */
  getProduct: (id: string) =>
    request<any>(SHOP_SERVICE_URL, `/products/${id}`, { method: 'GET' }),

  /** 兑换商品 */
  exchange: (userId: string, data: { productId: string; quantity?: number; address?: string; phone?: string; receiverName?: string }) => {
    const headers: Record<string, string> = { 'x-user-id': userId };
    return request<{ orderId: string }>(SHOP_SERVICE_URL, '/exchange', {
      method: 'POST',
      headers: headers as any,
      body: JSON.stringify(data),
    });
  },

  /** 获取订单列表 */
  getOrders: (userId: string, page = 1) => {
    const headers: Record<string, string> = { 'x-user-id': userId };
    return request<{ list: any[]; pagination: any }>(SHOP_SERVICE_URL, `/orders?page=${page}`, { headers: headers as any });
  },

  /** 确认收货 */
  confirmReceived: (userId: string, orderId: string) => {
    const headers: Record<string, string> = { 'x-user-id': userId };
    return request(SHOP_SERVICE_URL, `/orders/${orderId}/received`, {
      method: 'PUT',
      headers: headers as any,
    });
  },
};

// ============ WebSocket 客户端 ============
export class WSClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageHandlers: Map<string, Function[]> = new Map();
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  async connect() {
    const token = await getToken();
    if (!token) {
      throw new Error('未登录');
    }

    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(`${WS_URL}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startPing();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopPing();
        this.reconnect();
      };
    });
  }

  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  on(type: string, handler: Function) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  off(type: string, handler?: Function) {
    if (handler) {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    } else {
      this.messageHandlers.delete(type);
    }
  }

  private handleMessage(message: { type: string; payload: any }) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.payload));
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      this.send('ping', {});
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect().catch(console.error);
    }, delay);
  }
}

export const wsClient = new WSClient();
